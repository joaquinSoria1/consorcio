"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import LoginCard from './LoginCard'
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from 'react';
import AuroraBackground from "@/components/ui/aurorabackground";

export default function LoginPage() {
  return (
    <AuroraBackground>
      <div className="flex items-center justify-center h-screen bg-no-repeat bg-cover">
      <Head>
        <title>Inicio de Sesion</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Link href="/">
        <Button className="absolute top-3 left-3 font-semibold text-pretty">Volver al menu</Button>
      </Link>
      <Tabs defaultValue="residente" className="w-[400px]">
        <TabsList className="w-full">
          <TabsTrigger value="residente" className="w-full  data-[state=active]:bg-red-700 data-[state=active]:text-white data-[state=active]:shadow-sm">Residente</TabsTrigger>
          <TabsTrigger value="admin" className="w-full  data-[state=active]:bg-red-700 data-[state=active]:text-white data-[state=active]:shadow-sm">Administrador</TabsTrigger>
        </TabsList>
        <TabsContent value="residente">
          <LoginCard title="Residente" description="Bienvenido residente, por favor ingresa tus datos para logearte" role="user" />
        </TabsContent>
        <TabsContent value="admin">
          <LoginCard title="Administrador" description="Bienvenido administrador, por favor ingresa tus datos para logearte" role="admin" />
        </TabsContent>
      </Tabs>
    </div>
    </AuroraBackground>
  )
}



