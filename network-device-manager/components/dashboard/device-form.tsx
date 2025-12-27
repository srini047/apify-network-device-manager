"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Shield, User, Globe, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Device {
  ip: string;
  username: string;
  password: string;
  port: number;
}

export function DeviceForm({
  devices,
  onChange,
}: {
  devices: Device[];
  onChange: (d: Device[]) => void;
}) {
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>(
    {}
  );

  const addDevice = () => {
    onChange([
      ...devices,
      {
        ip: "",
        username: "root",
        password: "",
        port: 22,
      },
    ]);
  };

  const removeDevice = (index: number) => {
    onChange(devices.filter((_, i) => i !== index));
  };

  const updateDevice = (index: number, field: keyof Device, value: any) => {
    const newDevices = [...devices];
    newDevices[index] = { ...newDevices[index], [field]: value };
    onChange(newDevices);
  };

  const togglePassword = (index: number) => {
    setShowPasswords((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Target Devices</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={addDevice}>
          <Plus className="mr-2 h-4 w-4" /> Add Device
        </Button>
      </div>

      <div className="space-y-4">
        {devices.map((device, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-background/40 p-4 rounded-lg border border-border/50 relative group"
          >
            {/* IP Address */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                IP Address
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="192.168.1.1"
                  className="pl-9 h-9"
                  value={device.ip}
                  onChange={(e) =>
                    updateDevice(index, "ip", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* User */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                User
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="root"
                  className="pl-9 h-9"
                  value={device.username ?? "root"}
                  onChange={(e) =>
                    updateDevice(index, "username", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  type={showPasswords[index] ? "text" : "password"}
                  placeholder="••••••"
                  className="pl-9 pr-10 h-9"
                  value={device.password ?? ""}
                  onChange={(e) =>
                    updateDevice(index, "password", e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-muted-foreground/50 hover:text-foreground"
                  onClick={() => togglePassword(index)}
                >
                  {showPasswords[index] ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Port */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Port
              </label>
              <Input
                type="number"
                placeholder="22"
                min="1"
                max="65535"
                className="h-9 px-2"
                value={device.port ?? 22}
                onChange={(e) =>
                  updateDevice(index, "port", Number(e.target.value))
                }
              />
            </div>

            {/* Remove */}
            <div className="md:col-span-1 pb-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => removeDevice(index)}
                disabled={devices.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
