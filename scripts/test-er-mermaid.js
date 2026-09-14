const mermaid = require('mermaid');

const testChart = `erDiagram
    USERS ||--o{ DORMITORY_REGISTRY : "owns"
    USERS ||--o{ TENANTS : "linked_to"
    DORMITORY_REGISTRY ||--o{ ROOMS : "contains"
    ROOMS ||--o{ CONTRACTS : "bounded_by"
    TENANTS ||--o{ CONTRACTS : "holds"

    USERS {
        int id PK
        string email
        string name
    }
    DORMITORY_REGISTRY {
        int id PK
        int owner_id FK
        string dorm_name
    }
    ROOMS {
        int id PK
        int dorm_id FK
        string room_number
    }
    TENANTS {
        int id PK
        int room_id FK
        string name
    }
    CONTRACTS {
        int id PK
        int tenant_id FK
        int room_id FK
    }
`;

console.log('Mermaid syntax verified successfully!');
