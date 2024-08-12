import React, { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import Avvvatars from 'avvvatars-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/custom/image-upload';
import { User, Mail, Phone, AtSign, MapPin, Briefcase, Calendar, Edit } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Inicio({ userData, username }) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        username: '',
        email: '',
        telefono: '',
    });
    const userId = userData?._id;
    const imagenPerfil = userData?.imagenPerfil?.data;

    useEffect(() => {
        if (userData && username) {
            setFormData({
                nombres: userData.nombres || '',
                apellidos: userData.apellidos || '',
                username: username || '',
                email: userData.email || '',
                telefono: userData.telefono || '',
            });
            setIsLoading(false);
        }
    }, [userData, username]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/auth/signup/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setIsEditDialogOpen(false);
            } else {
                console.error('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (isLoading) {
        return (
            <main className="container h-full my-5 py-5 lg:gap-8 lg:py-0 flex flex-col justify-start items-center">
                <Card className="w-full max-w-4xl shadow-lg">
                    <CardHeader className="space-y-0 pb-2 bg-gradient-to-r from-gray-700 to-black text-white rounded-t-lg">
                        <div className="h-10 w-3/4" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                            <Skeleton className="w-64 h-64 rounded-full" />
                            <div className="flex flex-col gap-5 flex-grow w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[...Array(8)].map((_, index) => (
                                        <Skeleton key={index} className="h-20 w-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <hr className="my-6 border-t border-gray-200" />
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="container h-full my-5 py-5 lg:gap-8 lg:py-0 flex flex-col justify-start items-center">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader className="space-y-0 pb-2 bg-gradient-to-r from-gray-700 to-black text-white rounded-t-lg">
                    <CardTitle className="text-4xl font-bold p-4">Perfil de Usuario</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative group">
                                    {imagenPerfil ? (
                                        <img
                                            src={`data:image/jpeg;base64,${Buffer.from(imagenPerfil).toString('base64')}`}
                                            alt="Profile"
                                            className="w-64 h-64 rounded-full object-cover border-4  shadow-xl"
                                        />
                                    ) : (
                                        <Avvvatars value={username} size={250} style="character" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                        <p className="text-white text-lg font-semibold">Actualizar imagen</p>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-center">
                                        Sube tus imágenes aquí
                                    </DialogTitle>
                                    <DialogDescription className="text-center">
                                        ¡Sube tu imagen de perfil y muestra tu estilo único!
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <ImageUpload userId={userId}></ImageUpload>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <div className="flex flex-col gap-5 flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileItem icon={<User className="text-gray-700" />} label="Nombre" value={userData?.nombres} />
                                <ProfileItem icon={<User className="text-gray-700" />} label="Apellido" value={userData?.apellidos} />
                                <ProfileItem icon={<Mail className="text-gray-700" />} label="Email" value={userData?.email} />
                                <ProfileItem icon={<Phone className="text-gray-700" />} label="Teléfono" value={userData?.telefono} />
                                <ProfileItem icon={<AtSign className="text-gray-700" />} label="Username" value={username} />
                                <ProfileItem icon={<MapPin className="text-gray-700" />} label="Departamento" value={`${userData?.departamento?.numeroDepartamento}`} />
                                <ProfileItem icon={<Briefcase className="text-gray-700" />} label="Profesión" value={userData?.profesion || "No especificado"} />
                                <ProfileItem icon={<Calendar className="text-gray-700" />} label="Fecha de registro" value={new Date(userData?.createdAt).toLocaleDateString()} />
                            </div>
                        </div>
                    </div>
                    <hr className="my-6 border-t border-gray-200" />
                    <div className='flex justify-end'>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className='font-semibold' variant="outline">
                                    <Edit className="w-4 h-4 mr-2" /> Editar datos
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Editar Perfil de Usuario</DialogTitle>
                                    <DialogDescription>
                                        Realiza los cambios necesarios en tu perfil. Haz clic en guardar cuando hayas terminado.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Nombres" />
                                    <Input name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Apellidos" />
                                    <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" />
                                    <Input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" />
                                    <Input name="username" value={formData.username} onChange={handleChange} placeholder="Username" />
                                    <Input name="password" value={formData.password} onChange={handleChange} placeholder="Nueva contraseña" type="password" />
                                    <DialogFooter>
                                        <Button type="submit">Guardar cambios</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

function ProfileItem({ icon, label, value }) {
    return (
        <div className="flex items-center space-x-3  p-3 rounded-lg shadow">
            {icon}
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
            </div>
        </div>
    );
}