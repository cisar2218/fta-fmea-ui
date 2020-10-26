import * as React from "react";
import {createContext, useContext, useEffect, useState} from "react";

import {Component, CreateComponent} from "@models/componentModel";
import * as componentService from "@services/componentService"
import {axiosSource} from "@services/utils/axiosUtils";


type componentContextType = [Component[], (component: CreateComponent) => void];

export const componentsContext = createContext<componentContextType>(null!);

export const useComponents = () => {
    const [components, addComponent] = useContext(componentsContext);
    return [components, addComponent] as const;
}

type ComponentsProviderProps = {
    children: React.ReactNode;
};

export const ComponentsProvider = ({children}: ComponentsProviderProps) => {
    const [_components, _setComponents] = useState<Component[]>([]);

    const addComponent = async (component: CreateComponent) => {
        const newComponent = await componentService.create(component)
        _setComponents([..._components, newComponent])
    }

    useEffect(() => {
        const fetchComponents = async () => {
            const components = await componentService.findAll();
            console.log(components)
            _setComponents(components)
        }

        fetchComponents()
        return () => {axiosSource.cancel("ComponentsProvider - unmounting")}
    }, []);

    return (
        <componentsContext.Provider value={[_components, addComponent]}>
            {children}
        </componentsContext.Provider>
    );
}