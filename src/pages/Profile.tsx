import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Box, Card, CardContent, Typography, Avatar } from '@mui/material';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ minWidth: 350, p: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Avatar>
            <Typography variant="h5" gutterBottom>{user.firstName} {user.lastName}</Typography>
            <Typography color="text.secondary">{user.role.toUpperCase()}</Typography>
          </Box>
          <Typography variant="body1"><strong>Username:</strong> {user.username}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
