import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CrearDepartamentos({onSuccess}) {
  const [pisos, setPisos] = useState(1);
  const [departamentos, setDepartamentos] = useState('A');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/departamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pisos, departamentos }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Departamentos creados:', data);
        onSuccess(); 
      } else {
        console.error('Error al crear departamentos');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };


  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar departamentos</DialogTitle>
          <DialogDescription>
            Elige la cantidad de pisos y hasta qué letra de departamento para agregar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="piso" className="text-right">
                Pisos
              </Label>
              <Input
                id="piso"
                type="number"
                value={pisos}
                onChange={(e) => setPisos(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departamento" className="text-right">
                Departamentos
              </Label>
              <Input
                id="departamento"
                value={departamentos}
                onChange={(e) => setDepartamentos(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose><Button type="submit">Guardar cambios</Button></DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  );
}
