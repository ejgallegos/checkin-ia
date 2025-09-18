
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Services {
    id: number;
    wifi: boolean;
    cocina: boolean;
    aire_acondicionado: boolean;
    estacionamiento: boolean;
    ropa_cama: boolean;
    tv: boolean;
    piscina: boolean;
    calefaccion: boolean;
    bano_privado: boolean;
    mascotas: boolean;
}

interface Plan {
    id: number;
    nombre: string;
}

export interface Reservation {
    id: number;
    documentId: string;
    nombre_cliente: string;
    email_cliente: string;
    telefono_cliente: string;
    fecha_inicio: string;
    fecha_fin: string;
    cantidad_personas: number;
    estado: 'Pendiente' | 'Confirmada' | 'Cancelada';
    observaciones: string;
}

export interface Accommodation {
    id: number;
    documentId: string;
    denominacion: string;
    tipo: string;
    capacidad: number;
    precio_noche?: number;
    checkin: string;
    checkout: string;
    telefono: string;
    ubicacion: string;
    descripcion: string;
    politica_cancelacion: string;
    metodo_pago: string;
    reglas_casa: string;
    Servicios: Services;
    plan: Plan | null;
    reserva: Reservation[];
}


interface AuthContextType {
  user: User | null;
  accommodations: Accommodation[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (jwt: string, userData: User, accommodationData: any[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedAccommodations = localStorage.getItem('accommodations');

      if (storedToken && storedUser && storedAccommodations) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setAccommodations(JSON.parse(storedAccommodations));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('accommodations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (jwt: string, userData: User, accommodationData: any[]) => {
    const processedAccommodations = accommodationData.map(item => {
      // Ensure 'reserva' is always an array, even if it's missing or not an array.
      const reservas = Array.isArray(item.reserva) ? item.reserva : (item.reserva ? [item.reserva] : []);

      return {
          ...item,
          id: item.id,
          documentId: item.documentId,
          reserva: reservas.map((r: any) => ({ ...r, documentId: r.documentId || r.id.toString() }))
      };
    });
    
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accommodations', JSON.stringify(processedAccommodations));
    setToken(jwt);
    setUser(userData);
    setAccommodations(processedAccommodations);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accommodations');
    setToken(null);
    setUser(null);
    setAccommodations([]);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, accommodations, token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    

      