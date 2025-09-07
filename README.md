first i didn't found admin/users routes in back end 
so i did it and continue working 


# Parking Reservation System



A modern, real-time parking management system built with Next.js, Redux, TailwindCSS, and WebSocket integration.

## 🚀 Features

- **Real-time Updates**: WebSocket integration for live zone updates and admin actions
- **Role-based Authentication**: Separate interfaces for employees and administrators
- **Gate Check-in System**: Visitor and subscriber check-in with QR code simulation
- **Checkpoint Management**: Vehicle check-out with automated billing calculation
- **Admin Dashboard**: Complete control panel for managing zones, rates, employees, and more
- **Live Audit Log**: Real-time tracking of all admin actions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Backend API server running on `http://localhost:3000`
- WebSocket server running on `ws://localhost:3000/api/v1/ws`

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd parking-reservation-system