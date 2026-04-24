#!/bin/bash
# Universal project setup script for SmartCampus-Hub
# Works on Linux, macOS, and Windows (via Git Bash or WSL)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Windows (Git Bash or Cygwin)
is_windows() {
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "$WINDIR" ]]; then
        return 0
    else
        return 1
    fi
}

echo "========================================="
echo "SmartCampus-Hub - Universal Setup Script"
echo "========================================="
echo ""

# Detect OS
if is_windows; then
    print_info "Detected Windows (Git Bash/Cygwin)"
    MVNW_CMD="mvnw.cmd"
else
    print_info "Detected Unix/Linux/macOS"
    MVNW_CMD="./mvnw"
fi

# ============================================
# 1. Cleanup unwanted files and folders
# ============================================
print_info "Cleaning up unwanted files..."

# Build artifacts
rm -rf backend/target 2>/dev/null || true
rm -rf frontend/dist 2>/dev/null || true
rm -rf frontend/node_modules 2>/dev/null || true
rm -rf node_modules 2>/dev/null || true

# IDE files
rm -rf .idea .vscode 2>/dev/null || true

# Log files
find . -type f -name "*.log" -delete 2>/dev/null || true

# OS junk files
find . -type f -name ".DS_Store" -delete 2>/dev/null || true
find . -type f -name "Thumbs.db" -delete 2>/dev/null || true

print_success "Cleanup complete"

# ============================================
# 2. Copy .env.example to .env if not present
# ============================================
print_info "Setting up environment variables..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
    else
        print_warning ".env.example not found, creating default .env"
        cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=paf_lms
DB_USERNAME=root
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8081

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8081/api
EOF
        print_success "Created default .env"
    fi
else
    print_warning ".env already exists, skipping..."
fi

# ============================================
# 3. Sync .env to frontend/.env
# ============================================
if [ -d frontend ]; then
    if [ -f .env ]; then
        cp .env frontend/.env
        print_success "Synced .env to frontend/.env"
    else
        print_warning "No .env found to sync to frontend"
    fi
fi

# ============================================
# 4. Create backend .env if needed
# ============================================
if [ -d backend ]; then
    if [ ! -f backend/.env ] && [ -f .env ]; then
        cp .env backend/.env
        print_success "Created backend/.env from root .env"
    fi
fi

# ============================================
# 5. Install root npm dependencies (if package.json exists)
# ============================================
if [ -f package.json ]; then
    print_info "Installing root npm dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Root npm dependencies installed"
    else
        print_error "Root npm install failed"
        exit 1
    fi
else
    print_warning "No package.json found in root, skipping root npm install"
fi

# ============================================
# 6. Install backend dependencies (Maven Wrapper)
# ============================================
if [ -d backend ]; then
    print_info "Installing backend dependencies..."
    cd backend
    
    # Check if mvnw exists
    if [ ! -f "mvnw" ] && [ ! -f "mvnw.cmd" ]; then
        print_warning "Maven wrapper not found, generating..."
        mvn -N wrapper:wrapper 2>/dev/null || {
            print_error "Failed to generate Maven wrapper. Please ensure Maven is installed."
            exit 1
        }
    fi
    
    # Run Maven dependency resolution
    if is_windows; then
        cmd /c "mvnw.cmd dependency:resolve" 2>/dev/null || ./mvnw.cmd dependency:resolve
    else
        chmod +x mvnw 2>/dev/null || true
        ./mvnw dependency:resolve
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed"
    else
        print_warning "Maven dependency resolution had issues, but continuing..."
    fi
    
    cd ..
else
    print_warning "Backend directory not found, skipping backend setup"
fi

# ============================================
# 7. Install frontend dependencies (npm)
# ============================================
if [ -d frontend ]; then
    print_info "Installing frontend dependencies..."
    cd frontend
    
    # Check if package.json exists
    if [ ! -f package.json ]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    # Install dependencies
    npm install --force
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Frontend npm install failed"
        exit 1
    fi
    
    cd ..
else
    print_warning "Frontend directory not found, skipping frontend setup"
fi

# ============================================
# 8. Create H2 profile for testing (optional)
# ============================================
if [ -d backend/src/main/resources ]; then
    if [ ! -f backend/src/main/resources/application-h2.properties ]; then
        print_info "Creating H2 profile for testing..."
        cat > backend/src/main/resources/application-h2.properties << 'EOF'
# H2 In-Memory Database Configuration for testing/demo
spring.datasource.url=jdbc:h2:mem:paf_lms;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000

logging.level.org.springframework.security=DEBUG
logging.level.com.smartcampus.hub=DEBUG
EOF
        print_success "Created H2 profile"
    fi
fi

# ============================================
# 9. Print next steps
# ============================================
echo ""
echo "========================================="
print_success "Setup complete!"
echo "========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Configure your environment:"
echo "   Edit the .env file with your actual credentials:"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2️⃣  Start the Backend (choose one):"
echo ""
echo "   ${BLUE}With MySQL:${NC}"
echo "   cd backend && $MVNW_CMD spring-boot:run"
echo ""
echo "   ${BLUE}With H2 (no MySQL needed):${NC}"
echo "   cd backend && $MVNW_CMD spring-boot:run -Dspring-boot.run.profiles=h2"
echo ""
echo "3️⃣  Start the Frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4️⃣  Access the application:"
echo "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo "   Backend API: ${GREEN}http://localhost:8081${NC}"
echo "   Swagger UI: ${GREEN}http://localhost:8081/swagger-ui.html${NC}"
echo "   H2 Console: ${GREEN}http://localhost:8081/h2-console${NC} (when using H2 profile)"
echo ""
echo "========================================="
echo "🐛 Troubleshooting:"
echo "   - If ports are in use, change SERVER_PORT in .env"
echo "   - For MySQL issues, use the H2 profile instead"
echo "   - Run 'npm run dev -- --host' to allow network access"
echo "========================================="