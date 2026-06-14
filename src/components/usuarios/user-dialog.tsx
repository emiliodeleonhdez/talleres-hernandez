"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockData } from "@/lib/mock-data/store";
import { ROLE_LABELS, type Role, type User } from "@/lib/mock-data/types";

interface UserDialogProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLES: Role[] = ["SUPERADMIN", "OPERATOR"];

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const { createUser, updateUser } = useMockData();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<Role>(user?.role ?? "OPERATOR");

  function reset(u?: User) {
    setFullName(u?.fullName ?? "");
    setEmail(u?.email ?? "");
    setRole(u?.role ?? "OPERATOR");
  }

  function handleSubmit() {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Captura nombre y correo.");
      return;
    }
    if (user) {
      updateUser(user.id, { fullName: fullName.trim(), email: email.trim(), role });
      toast.success("Usuario actualizado");
    } else {
      createUser({ fullName: fullName.trim(), email: email.trim(), role });
      toast.success("Usuario creado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) reset(user);
        onOpenChange(o);
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            {user ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usr-name">Nombre completo</Label>
            <Input
              id="usr-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Rafael Hernández"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usr-email">Correo</Label>
            <Input
              id="usr-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usr-role">Rol</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Role)}
            >
              <SelectTrigger id="usr-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-brand hover:bg-brand/90">
            {user ? "Guardar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
