import api from '../lib/axios';

export interface UpdateProfileDTO {
    nombre?: string;
    apellido?: string;
    email?: string;
    usuario?: string;
    contraseniaActual?: string;
    nuevaContrasenia?: string;
}

export const updateProfile = async (data: UpdateProfileDTO) => {
    const response = await api.put('/lenders/me', data);
    return response.data;
};

export const login = async (data: any) => {
    if (data.usuario === 'demo' && data.contrasenia === 'demo') {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    token: 'mock-token-demo-123456',
                    prestamista: {
                        id: 999,
                        nombre: 'Usuario',
                        apellido: 'Demo',
                        usuario: 'demo',
                        correo: 'demo@tucredito.com'
                    }
                });
            }, 800);
        });
    }

    const response = await api.post('/lenders/login', data);
    return response.data;
};

export interface PrestamistaRegisterDto {
    nombre: string;
    apellido: string;
    correo: string;
    usuario: string;
    contrasenia: string;
}

export const registerLender = async (data: PrestamistaRegisterDto) => {
    const response = await api.post('/lenders/register', data);
    return response.data;
};
