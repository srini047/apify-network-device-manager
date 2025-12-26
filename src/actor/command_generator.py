"""
AI Command Generator using Cohere API

This module generates diagnostic commands based on problem descriptions
using Cohere's language model
"""

from dataclasses import dataclass
from enum import Enum
import os
from typing import List, Dict, Optional
import json

from apify import Actor
from cohere import AsyncClientV2


class CommandSeverity(Enum):
    """Command severity levels"""

    SAFE = "safe"
    WARN = "warn"


@dataclass
class GeneratedCommand:
    """
    Represents a generated command with metadata
    """
    command: str
    severity: CommandSeverity
    description: str
    reasoning: str

    def to_dict(self) -> Dict:
        return {
            "command": self.command,
            "severity": self.severity.value,
            "description": self.description,
            "reasoning": self.reasoning,
        }


class CohereClient:
    """
    Cohere Client for interacting with the Cohere API
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_base_url: Optional[str] = None,
        client_name: Optional[str] = "network-device-manager",
        timeout: Optional[int] = 120,
    ):
        """
        Initialize the CohereClient with the provided configuration
        """
        self.api_key = api_key or os.environ.get("COHERE_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "Cohere API key is required. Set COHERE_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        self.api_base_url = api_base_url
        self.client_name = client_name
        self.timeout = timeout

        self._async_client = AsyncClientV2(
            api_key=self.api_key,
            base_url=self.api_base_url,
            client_name=self.client_name,
            timeout=self.timeout,
            log_warning_experimental_features=False,
        )

    def get_client(self):
        """
        Get the Cohere client instance
        """
        return self._async_client


class AICommandGenerator:
    """
    Generate diagnostic commands using Cohere AI
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_base_url: Optional[str] = None,
        timeout: Optional[int] = 120,
    ):
        """
        Initialize the AI Command Generator
        """
        self.api_key = api_key
        self.cohere_client = CohereClient(
            api_key=api_key,
            api_base_url=api_base_url,
            timeout=timeout,
        )
        self.client = self.cohere_client.get_client()

    def _build_prompt(
        self,
        problem_description: str,
        include_warn_commands: bool,
    ) -> str:
        """
        Build the prompt for Cohere Generation
        """
        severity_note = (
            "Include both SAFE and WARN commands."
            if include_warn_commands
            else "Include only SAFE commands (read-only, non-disruptive operations)."
        )

        prompt = f"""You are a network diagnostics expert. Generate Linux/Unix shell commands to diagnose the following network device problem:

PROBLEM DESCRIPTION:
{problem_description}

REQUIREMENTS:
1. Generate 5-10 diagnostic commands
2. Prefer commands that provide output in structured formats (JSON, CSV, or easily parseable text)
3. {severity_note}
4. SAFE commands: Read-only operations (ps, netstat, cat /proc/*, ip addr, etc.)
5. WARN commands: Potentially disruptive operations (service restart, killall, rm, etc.)
6. Each command should help diagnose or resolve the described problem

Return your response as a JSON object with this EXACT structure:
{{
  "commands": [
    {{
      "command": "exact shell command to execute",
      "severity": "safe or warn",
      "description": "brief description of what this command does",
      "reasoning": "why this command helps diagnose the problem"
    }}
  ]
}}

IMPORTANT: 
- Generate the JSON object, no additional text
- Use actual Linux commands that would work on network devices
- Order commands from least to most invasive
- Be specific and practical
"""

        return prompt

    async def generate_commands(
        self,
        problem_description: str,
        include_warn_commands: bool = False,
    ) -> List[GeneratedCommand]:
        """
        Generate diagnostic commands based on problem description

        Args:
            problem_description: Description of the network issue
            include_warn_commands: Whether to include potentially dangerous commands

        Returns:
            List of GeneratedCommand objects
        """
        Actor.log.info("Generating commands to dissect the problem")

        # Build the prompt
        prompt = self._build_prompt(problem_description, include_warn_commands)

        try:
            # Call Cohere API using AsyncClientV2
            Actor.log.info("Calling Cohere API...")

            response = await self.client.chat(
                model="command-r-plus-08-2024",
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                temperature=0.7,
                response_format={
                    "type": "json_object",
                    "schema": {
                        "type": "object",
                        "required": ["commands"],
                        "properties": {
                            "commands": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": ["command", "severity", "description", "reasoning"],
                                    "properties": {
                                        "command": {"type": "string"},
                                        "severity": {"type": "string", "enum": ["safe", "warn"]},
                                        "description": {"type": "string"},
                                        "reasoning": {"type": "string"}
                                    }
                                }
                            }
                        }
                    }
                }
            )

            Actor.log.info("✓ Received response from Cohere API")

            # Parse the response
            commands = self._parse_cohere_response(response)
            Actor.log.info(f"✓ Generated {len(commands)} commands")

            return commands

        except Exception as e:
            Actor.log.error(f"Error calling Cohere API: {str(e)}")
            raise

    def _parse_cohere_response(self, response) -> List[GeneratedCommand]:
        """Parse Cohere API response and extract commands"""

        try:
            # Extract the text content from Cohere's response
            # AsyncClientV2 response structure: response.message.content[0].text
            if hasattr(response, "message") and hasattr(response.message, "content"):
                content_blocks = response.message.content

                # Find the text content block
                text_content = None
                for block in content_blocks:
                    if hasattr(block, "text"):
                        text_content = block.text
                        break

                if not text_content:
                    raise ValueError("No text content found in response")

                content = text_content
            else:
                raise ValueError(f"Unexpected response format: {response}")

            Actor.log.info(f"Parsing JSON response: {content}")

            # Parse JSON
            data = json.loads(content)

            if "commands" not in data:
                raise ValueError("Response missing 'commands' field")

            commands = []
            for cmd_data in data["commands"]:
                # Validate required fields
                if not all(k in cmd_data for k in ["command", "severity", "description", "reasoning"]):
                    Actor.log.warning(f"Skipping malformed command: {cmd_data}")
                    continue
                
                # Validate severity
                if cmd_data["severity"] not in ["safe", "warn"]:
                    Actor.log.warning(f"Invalid severity '{cmd_data['severity']}', defaulting to 'safe'")
                    cmd_data["severity"] = "safe"

                cmd = GeneratedCommand(
                    command=cmd_data["command"],
                    severity=CommandSeverity(cmd_data["severity"]),
                    description=cmd_data["description"],
                    reasoning=cmd_data["reasoning"],
                )
                commands.append(cmd)

            return commands

        except json.JSONDecodeError as e:
            Actor.log.error(f"Failed to parse JSON response: {str(e)}")
            Actor.log.error(
                f"Response content: {content if 'content' in locals() else 'N/A'}"
            )
            raise ValueError(f"Invalid JSON response from Cohere: {str(e)}")
        except (KeyError, AttributeError) as e:
            Actor.log.error(f"Missing required field in response: {str(e)}")
            raise ValueError(f"Malformed response from Cohere: {str(e)}")

def filter_commands_by_severity(
    commands: List[GeneratedCommand],
    include_warn: bool,
) -> List[str]:
    """
    Filter commands based on severity level
    """
    allowed_severities = {CommandSeverity.SAFE}
    if include_warn:
        allowed_severities.add(CommandSeverity.WARN)

    filtered = [
        cmd for cmd in commands if cmd.severity in allowed_severities
    ]

    Actor.log.info(
        "Filtered %d commands (include_warn=%s, total=%d)",
        len(filtered),
        include_warn,
        len(commands),
    )

    filtered_commands = {cmd.command for cmd in filtered}

    for cmd in commands:
        included = cmd.command in filtered_commands
        Actor.log.info(
            "  %s [%s] %s",
            "✓ INCLUDED" if included else "✗ EXCLUDED",
            cmd.severity.value.upper(),
            cmd.command if len(cmd.command) <= 50 else f"{cmd.command}",
        )

    return [cmd.command for cmd in filtered]
