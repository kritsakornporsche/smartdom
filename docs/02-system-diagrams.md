# System Analysis & Diagrams: SmartDom

จากการวิเคราะห์ระบบ SmartDom ทั้งโครงสร้างฐานข้อมูลและตรรกะของโค้ด ผมได้จัดทำไดอะแกรม (Diagrams) ที่สะท้อนถึงการทำงานของระบบในปัจจุบัน โดยใช้ภาษา Mermaid ซึ่งคุณสามารถนำไปอ้างอิงหรือใช้ประกอบรายงานได้ทันทีครับ

---

## 1. Context Diagram
แสดงภาพรวมของระบบและผู้ใช้งานกลุ่มต่างๆ (Actors) ที่เข้ามามีปฏิสัมพันธ์กับ SmartDom System

```mermaid
flowchart TD
    %% Actors
    Admin["Platform Admin"]
    Owner["Dormitory Owner"]
    Tenant["Tenant (ผู้เช่า)"]
    Keeper["Keeper (แม่บ้าน/ช่าง)"]
    Guest["Guest (ผู้สนใจ)"]

    %% System
    System(("SmartDom\nSaaS Platform"))

    %% Interactions
    Admin -->|Manage Packages\nView Platform Stats| System
    Owner -->|Manage Rooms/Bills\nAssign Keepers| System
    Tenant -->|Pay Bills\nRequest Maintenance| System
    Keeper -->|Update Job Status| System
    Guest -->|View Dormitory\nBook Room| System

    %% External Systems (Optional)
    PaymentGate["Payment Gateway"]
    System -.->|Process Payments| PaymentGate
```

> [!NOTE]
> ระบบ SmartDom เป็น Multi-tenant SaaS (ซอฟต์แวร์บริการสำหรับหอพัก) ที่ให้เจ้าของหอพักหลายๆ แห่งสามารถเข้ามาใช้ระบบร่วมกันได้ โดยแบ่งแยกสิทธิ์ชัดเจนผ่าน Role-based Access Control (RBAC)

---

## 2. Entity Relationship Diagram (ERD / Relation Diagram)
โครงสร้างของฐานข้อมูล `smartdomdb` แบบ Single-database (รวมทุกหอพักไว้ในฐานข้อมูลเดียว)

```mermaid
erDiagram
    USERS ||--o{ USER_DORM_ROLES : has
    USERS ||--o{ DORMITORY_REGISTRY : "owns (owner_id)"
    USERS {
        int id PK
        string email UK
        string password
        string name
        enum primary_role "owner, tenant, keeper, guest"
    }

    PLATFORM_ADMINS {
        int id PK
        string email UK
        string password
        string name
        enum role "super_admin, support"
    }

    DORMITORY_REGISTRY ||--o{ USER_DORM_ROLES : "belongs to"
    DORMITORY_REGISTRY ||--o{ ROOMS : has
    DORMITORY_REGISTRY ||--o{ TENANTS : has
    DORMITORY_REGISTRY ||--o{ BILLS : has
    DORMITORY_REGISTRY ||--o{ SUBSCRIPTIONS : subscribes
    DORMITORY_REGISTRY {
        int id PK
        int owner_id FK
        string dorm_name
        enum status "Active, Suspended"
    }

    USER_DORM_ROLES {
        int id PK
        int user_id FK
        int dorm_id FK
        enum role "owner, keeper, tenant, guest"
    }

    ROOMS ||--o{ TENANTS : occupies
    ROOMS {
        int id PK
        int dorm_id FK
        string room_number
        decimal price
        enum status "Available, Occupied, Maintenance"
    }

    TENANTS ||--o{ BILLS : receives
    TENANTS ||--o{ MAINTENANCE_REQUESTS : requests
    TENANTS {
        int id PK
        int dorm_id FK
        int user_id FK
        int room_id FK
        enum status "active, past, pending"
    }

    BILLS {
        int id PK
        int dorm_id FK
        int tenant_id FK
        decimal amount
        enum status "Unpaid, Paid"
    }

    MAINTENANCE_REQUESTS ||--o{ MAINTENANCE_JOBS : "converted to"
    MAINTENANCE_REQUESTS {
        int id PK
        int dorm_id FK
        int tenant_id FK
        string description
        enum status "Pending, InProgress, Completed"
    }

    MAINTENANCE_JOBS {
        int id PK
        int dorm_id FK
        int room_id FK
        int assigned_to FK "Keeper user_id"
        enum status "pending, in_progress, completed"
    }

    PACKAGES ||--o{ SUBSCRIPTIONS : provides
    PACKAGES {
        int id PK
        string name
        decimal price
        int max_rooms
    }
```

> [!TIP]
> สถาปัตยกรรมนี้ใช้ตาราง `user_dorm_roles` เป็นตัวเชื่อมว่า User หนึ่งคนมีบทบาท (Role) อะไรใน `dorm_id` ไหน ทำให้ User 1 คนสามารถเป็นเจ้าของหอพัก A และเป็นผู้เช่าที่หอพัก B ได้พร้อมกันด้วยอีเมลเดียว

---

## 3. Sequence Diagram (Authentication & Authorization Flow)
แสดงขั้นตอนการทำงานเมื่อผู้ใช้งาน (เช่น ผู้เช่าหรือเจ้าของหอพัก) ทำการเข้าสู่ระบบผ่าน API

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Client
    participant Auth as NextAuth (proxy.ts & auth.ts)
    participant DB as MySQL DB (smartdomdb)

    User->>Frontend: Enter Email & Password
    Frontend->>Auth: POST /api/auth/callback/credentials
    
    rect rgb(240, 248, 255)
        Note over Auth,DB: 1. Authentication Check
        Auth->>DB: SELECT id, password FROM users WHERE email = ?
        DB-->>Auth: Return User Record (Hashed Password)
        Auth->>Auth: bcrypt.compare(password, hash)
    end
    
    rect rgb(255, 250, 240)
        Note over Auth,DB: 2. Authorization (Role Mapping)
        Auth->>DB: SELECT role, dorm_id FROM user_dorm_roles WHERE user_id = ?
        alt User has Dorm Role
            DB-->>Auth: Return 'owner', dorm_id = 1
            Auth->>Auth: Create JWT (role='owner', dormId=1)
        else No Dorm Role (New User)
            DB-->>Auth: Empty
            Auth->>DB: Check primary_role in users table
            DB-->>Auth: Return 'guest'
            Auth->>Auth: Create JWT (role='guest', dormId=null)
        end
    end

    Auth-->>Frontend: Return Session Cookie
    Frontend->>User: Redirect to Dashboard (/owner or /explore)
```

---

## 4. Sequence Diagram (Data Isolation: Viewing Rooms)
แสดงขั้นตอนที่เจ้าของหอพักพยายามดึงข้อมูลห้องพัก โดยระบบต้องป้องกันไม่ให้ข้อมูลรั่วไหลข้ามหอพัก (Data Isolation)

```mermaid
sequenceDiagram
    actor Owner
    participant API as /api/rooms/route.ts
    participant Auth as Session Context
    participant DB as MySQL DB

    Owner->>API: GET /api/rooms
    API->>Auth: await auth()
    Auth-->>API: Session (role: 'owner', dormId: 1)
    
    alt Unauthorized or Missing dormId
        API-->>Owner: 401 Unauthorized / 400 Missing context
    else Authorized
        API->>DB: SELECT * FROM rooms WHERE dorm_id = 1
        DB-->>API: Return [Room 101, Room 102]
        API-->>Owner: 200 OK (JSON Data)
    end
```

> [!IMPORTANT]
> ระบบปัจจุบันได้ออกแบบให้ Middleware (`proxy.ts`) ตรวจสอบสิทธิ์ระดับหน้าเว็บ (Route-level) ก่อน ส่วนระดับ API (`/api/...`) จะใช้ตัวแปร `dormId` จาก Session เข้าไปกรอง (Filter) ในคำสั่ง Raw SQL เพื่อบังคับให้ดึงข้อมูลเฉพาะหอพักนั้นๆ เสมอ (Data Isolation)
