import { Router } from 'express';
import multer from 'multer';
import { biosController } from '../controllers/bios.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size for BIOS
  },
  fileFilter: (_req, file, cb) => {
    // Accept various BIOS file extensions
    const allowedExtensions = [
      '.bin',
      '.bios',
      '.rom',
      '.img',
      '.dat',
    ];

    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${ext}`));
    }
  },
});

// Public routes
router.get('/', (req, res) =>
  biosController.getAllBiosFiles(req, res)
);

router.get('/system/:system', (req, res) =>
  biosController.getBiosFilesBySystem(req, res)
);

router.get('/systems/requiring-bios', (req, res) =>
  biosController.getSystemsRequiringBios(req, res)
);

router.get('/:id/download', (req, res) =>
  biosController.getBiosDownloadUrl(req, res)
);

// Admin routes (require authentication and admin role)
router.use(authenticate);
router.use(requireAdmin);

router.post('/upload', upload.single('bios'), (req, res) =>
  biosController.uploadBiosFile(req as any, res)
);

router.patch('/:id', (req, res) =>
  biosController.updateBiosFile(req as any, res)
);

router.delete('/:id', (req, res) =>
  biosController.deleteBiosFile(req as any, res)
);

router.post('/:id/verify', (req, res) =>
  biosController.verifyBiosMd5(req as any, res)
);

export default router;
