import { Box, Skeleton, Paper, Grid, Stack } from '@mui/material';

interface LoadingProps {
  variant?: 'page' | 'table' | 'card' | 'form' | 'list';
  rows?: number;
}

const Loading: React.FC<LoadingProps> = ({ 
  variant = 'page', 
  rows = 5
}) => {
  const renderPageSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTableSkeleton = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" width="25%" height={32} />
      </Box>
      
      {/* Table header */}
      <Box sx={{ display: 'flex', mb: 1 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={{ flex: 1, mr: 2 }}>
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
        ))}
      </Box>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', mb: 1 }}>
          {Array.from({ length: 5 }).map((_, colIndex) => (
            <Box key={colIndex} sx={{ flex: 1, mr: 2 }}>
              <Skeleton variant="text" width="90%" height={20} />
            </Box>
          ))}
        </Box>
      ))}
    </Paper>
  );

  const renderCardSkeleton = () => (
    <Grid container spacing={2}>
      {Array.from({ length: rows }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton variant="rectangular" width={60} height={24} />
              <Skeleton variant="rectangular" width={80} height={24} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderFormSkeleton = () => (
    <Paper sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {Array.from({ length: rows }).map((_, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Skeleton variant="rectangular" width={100} height={36} />
        <Skeleton variant="rectangular" width={100} height={36} />
      </Box>
    </Paper>
  );

  const renderListSkeleton = () => (
    <Paper sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width={24} height={24} />
        </Box>
      ))}
    </Paper>
  );

  switch (variant) {
    case 'table':
      return renderTableSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'form':
      return renderFormSkeleton();
    case 'list':
      return renderListSkeleton();
    default:
      return renderPageSkeleton();
  }
};

export default Loading;
