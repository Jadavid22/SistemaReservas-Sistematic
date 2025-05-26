import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        nombre: "Juan Pérez",
        email: "juan.perez@example.com",
        telefono: "123456789",
        direccion: "Calle Falsa 123",
        fechaRegistro: "2023-01-01T00:00:00Z"
    });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
}; 