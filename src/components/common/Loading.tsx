import React from 'react';
import { Box, Skeleton, Paper, Grid, Stack, useTheme, keyframes } from '@mui/material';

interface LoadingProps {
  variant?: 'page' | 'table' | 'card' | 'form' | 'list';
  rows?: number;
}

// Enhanced shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const Loading: React.FC<LoadingProps> = ({ 
  variant = 'page', 
  rows = 5
}) => {
  const theme = useTheme();

  // Enhanced skeleton with custom styling
  interface CustomSkeletonProps {
    variant?: 'text' | 'rectangular' | 'circular';
    width?: number | string;
    height?: number | string;
    sx?: object;
    animation?: 'pulse' | 'wave' | false;
    [key: string]: unknown;
  }

  const CustomSkeleton = ({ 
    variant: skeletonVariant = 'text', 
    width, 
    height, 
    sx = {},
    animation = 'wave',
    ...props 
  }: CustomSkeletonProps) => (
    <Skeleton
      variant={skeletonVariant}
      width={width}
      height={height}
      animation={animation}
      sx={{
        backgroundColor: 'rgba(139, 69, 19, 0.06)',
        '&::after': {
          background: `linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)`,
        },
        borderRadius: skeletonVariant === 'rectangular' ? 2 : 
                     skeletonVariant === 'circular' ? '50%' : 1,
        ...sx
      }}
      {...props}
    />
  );

  // Modern card wrapper
  const LoadingCard = ({ children, elevated = false }: { children: React.ReactNode, elevated?: boolean }) => (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,240,0.9) 100%)',
        border: '1px solid rgba(139, 69, 19, 0.08)',
        boxShadow: elevated ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': elevated ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 50%, transparent 100%)',
        } : {},
      }}
    >
      {children}
    </Paper>
  );

  const renderPageSkeleton = () => (
    <Box sx={{ p: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <CustomSkeleton variant="text" width="35%" height={48} sx={{ mb: 2 }} />
        <CustomSkeleton variant="text" width="65%" height={24} sx={{ mb: 1 }} />
        <CustomSkeleton variant="text" width="45%" height={20} />
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <LoadingCard>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CustomSkeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <CustomSkeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                  <CustomSkeleton variant="text" width="40%" height={16} />
                </Box>
              </Box>
              <CustomSkeleton variant="text" width="80%" height={32} />
            </LoadingCard>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <LoadingCard elevated>
            <Box sx={{ mb: 3 }}>
              <CustomSkeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <CustomSkeleton variant="rectangular" width={120} height={36} />
                <CustomSkeleton variant="rectangular" width={100} height={36} />
                <CustomSkeleton variant="rectangular" width={80} height={36} />
              </Box>
            </Box>
            <CustomSkeleton variant="rectangular" height={320} sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CustomSkeleton variant="text" width="25%" height={20} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CustomSkeleton variant="circular" width={32} height={32} />
                <CustomSkeleton variant="circular" width={32} height={32} />
                <CustomSkeleton variant="circular" width={32} height={32} />
              </Box>
            </Box>
          </LoadingCard>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <LoadingCard>
              <CustomSkeleton variant="text" width="50%" height={24} sx={{ mb: 3 }} />
              {Array.from({ length: 5 }).map((_, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CustomSkeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <CustomSkeleton variant="text" width="70%" height={18} sx={{ mb: 0.5 }} />
                    <CustomSkeleton variant="text" width="50%" height={14} />
                  </Box>
                  <CustomSkeleton variant="text" width="20%" height={16} />
                </Box>
              ))}
            </LoadingCard>
            
            <LoadingCard>
              <CustomSkeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
              <CustomSkeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
              <CustomSkeleton variant="text" width="40%" height={18} />
            </LoadingCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTableSkeleton = () => (
    <LoadingCard elevated>
      {/* Table Header */}
      <Box sx={{ mb: 3 }}>
        <CustomSkeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <CustomSkeleton variant="rectangular" width={120} height={40} />
          <CustomSkeleton variant="rectangular" width={100} height={40} />
          <Box sx={{ flex: 1 }} />
          <CustomSkeleton variant="rectangular" width={140} height={40} />
        </Box>
      </Box>
      
      {/* Table Column Headers */}
      <Box sx={{ 
        display: 'flex', 
        mb: 2, 
        pb: 2, 
        borderBottom: '1px solid rgba(139, 69, 19, 0.08)' 
      }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Box key={index} sx={{ flex: index === 0 ? 2 : 1, mr: 2 }}>
            <CustomSkeleton variant="text" width="70%" height={20} />
          </Box>
        ))}
      </Box>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box 
          key={rowIndex} 
          sx={{ 
            display: 'flex', 
            mb: 2,
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(139, 69, 19, 0.02)',
            }
          }}
        >
          {Array.from({ length: 6 }).map((_, colIndex) => (
            <Box key={colIndex} sx={{ flex: colIndex === 0 ? 2 : 1, mr: 2 }}>
              {colIndex === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomSkeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                  <CustomSkeleton variant="text" width="60%" height={18} />
                </Box>
              ) : colIndex === 5 ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CustomSkeleton variant="circular" width={28} height={28} />
                  <CustomSkeleton variant="circular" width={28} height={28} />
                </Box>
              ) : (
                <CustomSkeleton variant="text" width="80%" height={18} />
              )}
            </Box>
          ))}
        </Box>
      ))}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: '1px solid rgba(139, 69, 19, 0.08)' }}>
        <CustomSkeleton variant="text" width="20%" height={18} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <CustomSkeleton key={index} variant="circular" width={32} height={32} />
          ))}
        </Box>
      </Box>
    </LoadingCard>
  );

  const renderCardSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: rows }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <LoadingCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CustomSkeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <CustomSkeleton variant="text" width="70%" height={24} sx={{ mb: 0.5 }} />
                <CustomSkeleton variant="text" width="50%" height={18} />
              </Box>
            </Box>
            
            <CustomSkeleton variant="rectangular" height={140} sx={{ mb: 3, borderRadius: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <CustomSkeleton variant="text" width="90%" height={18} sx={{ mb: 1 }} />
              <CustomSkeleton variant="text" width="70%" height={18} />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CustomSkeleton variant="rectangular" width={80} height={32} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CustomSkeleton variant="circular" width={32} height={32} />
                <CustomSkeleton variant="circular" width={32} height={32} />
              </Box>
            </Box>
          </LoadingCard>
        </Grid>
      ))}
    </Grid>
  );

  const renderFormSkeleton = () => (
    <LoadingCard elevated>
      <CustomSkeleton variant="text" width="35%" height={36} sx={{ mb: 4 }} />
      
      <Grid container spacing={3}>
        {Array.from({ length: rows }).map((_, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box sx={{ mb: 3 }}>
              <CustomSkeleton variant="text" width="40%" height={20} sx={{ mb: 1.5 }} />
              <CustomSkeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
            </Box>
          </Grid>
        ))}
        
        {/* Full width fields */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <CustomSkeleton variant="text" width="30%" height={20} sx={{ mb: 1.5 }} />
            <CustomSkeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          </Box>
        </Grid>
      </Grid>

      {/* Form Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 4,
        pt: 3,
        borderTop: '1px solid rgba(139, 69, 19, 0.08)'
      }}>
        <CustomSkeleton variant="rectangular" width={100} height={40} />
        <CustomSkeleton variant="rectangular" width={120} height={40} />
      </Box>
    </LoadingCard>
  );

  const renderListSkeleton = () => (
    <LoadingCard>
      <Box sx={{ mb: 3 }}>
        <CustomSkeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CustomSkeleton variant="rectangular" width={200} height={40} />
          <CustomSkeleton variant="rectangular" width={120} height={40} />
        </Box>
      </Box>

      {Array.from({ length: rows }).map((_, index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            py: 2,
            borderBottom: index < rows - 1 ? '1px solid rgba(139, 69, 19, 0.06)' : 'none',
            '&:hover': {
              backgroundColor: 'rgba(139, 69, 19, 0.02)',
              borderRadius: 2,
            }
          }}
        >
          <CustomSkeleton variant="circular" width={48} height={48} sx={{ mr: 3 }} />
          <Box sx={{ flex: 1 }}>
            <CustomSkeleton variant="text" width="60%" height={22} sx={{ mb: 0.5 }} />
            <CustomSkeleton variant="text" width="40%" height={18} sx={{ mb: 0.5 }} />
            <CustomSkeleton variant="text" width="30%" height={16} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CustomSkeleton variant="rectangular" width={60} height={24} />
            <CustomSkeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
      ))}
    </LoadingCard>
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