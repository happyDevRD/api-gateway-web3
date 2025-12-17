# Web3 API Gateway - Panel Administrativo

> **Nuevo:** Ahora con despliegue Docker y Panel de Administración RBAC completo.

Un sistema de control de acceso descentralizado que utiliza Contratos Inteligentes de Ethereum para gestionar la autorización de APIs. Este proyecto demuestra cómo proteger microservicios utilizando un Spring Cloud Gateway que verifica roles de usuario ("ADMIN", "USER") directamente en la blockchain.

## ✨ Características Principales

* **Autenticación Descentralizada:** Sin base de datos de usuarios. Tu billetera es tu llave.
* **RBAC en Blockchain:** Los roles y permisos se almacenan en un contrato inteligente `AccessPolicy.sol`.
* **API Gateway Inteligente:** Intercepta tráfico y verifica permisos en tiempo real contra la blockchain.
* **Panel de Administración (React):** Interfaz gráfica para:
  * Gestionar Roles (Asignar ADMIN/USER a cualquier billetera).
  * Gestionar Políticas (Definir qué roles acceden a qué rutas).
  * Probar el acceso End-to-End.
* **Dockerizado:** Despliegue en un comando.

## 🚀 Inicio Rápido con Docker

### Requisitos

* Docker y Docker Compose
* Node.js (Solo para la Blockchain local)

### 1. Iniciar la Blockchain (Hardhat)

Necesitamos una blockchain local corriendo en tu máquina.

```bash
cd contracts
npm install
npx hardhat node
```

*Deja esta terminal abierta.*

### 2. Desplegar Contrato Inteligente

En una **nueva terminal**, despliega el contrato de políticas:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Arrancar la Aplicación

Levanta el Gateway, el Microservicio y el Frontend con un solo comando:

```bash
# Desde la raíz del proyecto
sudo chmod 666 /var/run/docker.sock # (Solo si tienes problemas de permisos)
docker compose up --build -d
```

### 4. Acceder

Abre tu navegador en: **<http://localhost>**

1. Conecta tu MetaMask (Red: Localhost 8545, ChainID: 31337).
2. Usa el **"Gestor de Roles"** para asignarte el rol `USER` o `ADMIN`.
3. Usa el **"Gestor de Políticas"** para proteger la ruta `/api/data`.
4. Prueba el acceso con los botones de test.

---

## 🛠 Ejecución Manual (Legacy/Desarrollo)

Si prefieres ejecutar cada servicio individualmente sin Docker:

1. **Blockchain:** `cd contracts && npx hardhat node`
2. **Contrato:** `cd contracts && npx hardhat run scripts/deploy.js --network localhost`
3. **Servicio:** `cd service && ./gradlew bootRun` (Puerto 8081)
4. **Gateway:** `cd gateway && ./gradlew bootRun` (Puerto 8080)
5. **Frontend:** `cd frontend && npm install && npm run dev` (Puerto 5173)

## 🏗 Arquitectura

```
├── contracts/       # Solidity (RBAC AccessPolicy)
├── gateway/         # Spring Cloud Gateway (Web3 Auth Filter)
├── service/         # Microservicio Protegido (Java)
├── frontend/        # React + Vite (Admin Dashboard)
└── docker-compose.yml # Orquestación
```
