
# first of all :
 i didn't found admin/users routes in backend 
so i updated backend file and attach it file named backend so you should run it for admin/users work fine


// Admin get employees
app.get(BASE + '/admin/users', (req, res) => {
  const user = req.user;
  if (!user || user.role !== 'admin') return res.status(403).json({ status:'error', message:'Forbidden' });
  const users = db.users.filter(u => u.role === 'employee').map(u => ({ id: u.id, username: u.username, role: u.role }));
  res.json(users);
});
// Admin add employees
app.post(BASE + '/admin/users', (req, res) => {
  const user = req.user;
  if (!user || user.role !== 'admin') return res.status(403).json({ status:'error', message:'Forbidden' });
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ status:'error', message:'Missing fields' });
  const newUser = { id: 'user_' + uuidv4().split('-')[0], username, password, role };
  db.users.push(newUser);
  res.status(201).json(newUser);
});


# Parking Reservation System



A modern, real-time parking management system built with Next.js, Redux,tanstack query, TailwindCSS, and WebSocket integration.

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

cd backend
npm i 
npm run start


cd parking-reservation-system
npm i 
npm run dev