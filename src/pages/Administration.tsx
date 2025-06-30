import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import UserManagement from '../components/administration/UserManagement';
import ActivityLogs from '../components/administration/ActivityLogs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`administration-tabpanel-${index}`}
      aria-labelledby={`administration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Administration: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
        Administration
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="User Management" />
          <Tab label="Activity Logs" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <UserManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ActivityLogs />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Administration;