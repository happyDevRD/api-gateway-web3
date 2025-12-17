# Web3 API Gateway

Un sistema de control de acceso descentralizado que utiliza Contratos Inteligentes de Ethereum para gestionar la autorización de APIs. Este proyecto demuestra cómo proteger microservicios utilizando un Spring Cloud Gateway que verifica la identidad del usuario contra un registro "on-chain".

## 🏗 Arquitectura

El proyecto consta de cuatro componentes principales:

1. **Contratos Inteligentes (`/contracts`)**:
    * Construido con Hardhat.
    * `AccessRegistry.sol`: Almacena la lista de direcciones de billeteras autorizadas.
2. **API Gateway (`/gateway`)**:
    * Spring Boot + Spring Cloud Gateway.
    * `AuthFilter`: Intercepta cada solicitud.
    * `AccessRegistryService`: Consulta el contrato inteligente usando Web3j para verificar si la `X-Web3-Address` tiene acceso.
3. **Microservicio Protegido (`/service`)**:
    * Aplicación Spring Boot.
    * Contiene los datos protegidos. No es accesible directamente (en un entorno de producción) y depende del Gateway para su protección.
4. **Frontend (`/frontend`)**:
    * Aplicación React + Vite (En Trabajo).

## 🚀 Requisitos Previos

* **Java 17+** (Requerido para Gateway y Service)
* **Node.js v18+** (Requerido para Hardhat y Frontend)
* **Git**

## 🛠️ Configuración e Instalación

1. **Clonar el repositorio:**

    ```bash
    git clone https://github.com/tu-usuario/api-gateway-web3.git
    cd api-gateway-web3
    ```

2. **Instalar Dependencias del Contrato:**

    ```bash
    cd contracts
    npm install
    ```

## 🏃‍♂️ Ejecución Local

Para ejecutar el sistema completo, necesitas 4 terminales.

### Terminal 1: Blockchain Local

Inicia un nodo local de Hardhat para simular la red Ethereum.

```bash
cd contracts
npx hardhat node
```

*Mantenlo ejecutándose. Generará una lista de cuentas de prueba.*

### Terminal 2: Desplegar y Configurar Contratos

Despliega el contrato `AccessRegistry` en tu nodo local.

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

*Copia la dirección desplegada si difiere de la predeterminada `0x5FbDB2315678afecb367f032d93F642f64180aa3`.*

Otorga acceso a un usuario de prueba (ej. Cuenta #1 de Hardhat):

```bash
npx hardhat run scripts/grantAccess.js --network localhost
```

### Terminal 3: Servicio Protegido

Ejecuta el microservicio backend (Puerto 8081).

```bash
cd service
./gradlew bootRun
```

### Terminal 4: API Gateway

Ejecuta el API Gateway (Puerto 8080).

```bash
cd gateway
# Asegúrate de que gateway/src/main/resources/application.properties tenga la contract.address correcta
./gradlew bootRun
```

## 🧪 Pruebas

Usa `curl` para verificar el control de acceso.

**✅ Solicitud Autorizada:**
Reemplaza con una dirección a la que se le otorgó acceso (ej. Cuenta #1).

```bash
curl -v -H "X-Web3-Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" http://localhost:8080/api/data
```

> **Resultado Esperado:** `200 OK` - "This is protected data accessible only to authorized Service Owners!"

**⛔ Solicitud No Autorizada:**
Usando una dirección aleatoria.

```bash
curl -v -H "X-Web3-Address: 0x1234567890123456789012345678901234567890" http://localhost:8080/api/data
```

> **Resultado Esperado:** `403 Forbidden`

## 📁 Estructura del Proyecto

```
├── contracts/       # Contratos Inteligentes Hardhat
├── gateway/         # Spring Boot API Gateway (Lógica de Auth)
├── service/         # Microservicio Protegido
├── frontend/        # Frontend React
└── README.md        # Este archivo
```
