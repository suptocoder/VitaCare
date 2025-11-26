# Quick Performance Optimization Reference

## 🚀 Quick Start

### 1. File Upload with Progress
```tsx
import { optimizedFileUpload, validateFile } from '@/lib/fileUpload';

const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = async (file: File) => {
  // Validate
  const validation = validateFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // Upload with progress
  const { finalUrl } = await optimizedFileUpload(file, (progress) => {
    setUploadProgress(progress);
  });
};
```

### 2. Cached Data Fetching
```tsx
import { useFetch } from '@/lib/useFetch';

function MyComponent() {
  const { data, isLoading, error, refetch, mutate } = useFetch('/api/data', {
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    refetchOnFocus: true,
  });

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <div>Error: {error}</div>}
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

### 3. Lazy Loading Components
```tsx
import { LazyLoad, LoadingSpinner } from '@/components/ui/LazyLoad';
import dynamic from 'next/dynamic';

// Dynamic import with lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});

function MyPage() {
  return (
    <LazyLoad>
      <HeavyComponent />
    </LazyLoad>
  );
}
```

## 📊 Performance Monitoring

```tsx
import { performanceMonitor, logWebVitals } from '@/lib/performance';

// Measure operation
const duration = await performanceMonitor.measure('fetch-data', async () => {
  return await fetch('/api/data');
});

// View summary
performanceMonitor.logSummary();

// Check Web Vitals
logWebVitals();
```

## ⚡ Key Features

### File Upload
- ✅ Automatic image compression (50-80% size reduction)
- ✅ Reliable single-request uploads
- ✅ Real-time progress tracking
- ✅ File validation
- ✅ Error handling

### Data Fetching
- ✅ Intelligent caching (5-minute default)
- ✅ Auto-refetch on focus
- ✅ Auto-refetch on reconnect
- ✅ Optimistic updates
- ✅ Polling support

### Performance
- ✅ gzip compression
- ✅ Image optimization (AVIF/WebP)
- ✅ Code splitting
- ✅ Bundle optimization
- ✅ Aggressive caching

## 🎯 Common Patterns

### Upload with Optimistic Update
```tsx
const handleUpload = async (file: File) => {
  const tempRecord = { id: 'temp', title: file.name, /* ... */ };
  
  // Optimistic update
  mutate([tempRecord, ...records]);
  
  try {
    const { finalUrl } = await optimizedFileUpload(file);
    const newRecord = await createRecord(finalUrl);
    
    // Replace temp with real record
    mutate([newRecord, ...records.filter(r => r.id !== 'temp')]);
  } catch (error) {
    // Rollback on error
    mutate(records.filter(r => r.id !== 'temp'));
  }
};
```

### Prefetch Data
```tsx
import { prefetch } from '@/lib/useFetch';

// Prefetch on hover
<Link 
  href="/dashboard"
  onMouseEnter={() => prefetch('/api/dashboard-data')}
>
  Dashboard
</Link>
```

### Clear Cache
```tsx
import { clearCache } from '@/lib/useFetch';

// Clear specific URL
clearCache('/api/records');

// Clear all cache
clearCache();
```

## 🔧 Configuration

### Adjust Cache Duration
```tsx
useFetch('/api/data', {
  cacheDuration: 10 * 60 * 1000, // 10 minutes
})
```

### Disable Auto-Refetch
```tsx
useFetch('/api/data', {
  refetchOnFocus: false,
  refetchOnReconnect: false,
})
```

### Enable Polling
```tsx
useFetch('/api/data', {
  pollingInterval: 30000, // Poll every 30 seconds
})
```

### Custom File Validation
```tsx
validateFile(file, 
  20, // Max 20MB
  ['image/jpeg', 'image/png'] // Only JPEG and PNG
)
```

## 📈 Performance Tips

1. **Cache frequently accessed data** (user profile, settings)
2. **Compress images before upload** (automatic with optimizedFileUpload)
3. **Show loading states** (spinners, skeletons)
4. **Lazy load heavy components** (charts, tables)
5. **Monitor performance** (check Web Vitals regularly)

## 🐛 Debugging

### Check Upload Progress
```tsx
console.log(`Upload: ${uploadProgress}%`);
// 0-10%: Compressing
// 10-20%: Getting upload URL
// 20-100%: Uploading file
```

### Check Cache Status
```tsx
const metrics = performanceMonitor.getMetrics();
console.log('Cache hits:', metrics.filter(m => m.name.includes('cache')));
```

### Monitor Slow Operations
```tsx
// Automatically warns if operation > 1 second
performanceMonitor.measure('slow-operation', async () => {
  // Your code
});
```

## 📚 Learn More

- Full documentation: `PERFORMANCE.md`
- File upload: `src/lib/fileUpload.ts`
- Data fetching: `src/lib/useFetch.ts`
- Performance monitoring: `src/lib/performance.ts`
