import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RomUpload } from '../../components/RomUpload';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api');

describe.skip('RomUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload form', () => {
    render(<RomUpload />);

    expect(screen.getByText('UPLOAD ROM')).toBeInTheDocument();
    expect(screen.getByLabelText(/GAME TITLE/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SYSTEM/i)).toBeInTheDocument();
  });

  it('should allow file selection via input', async () => {
    render(<RomUpload />);

    const file = new File(['test'], 'super-mario.nes', {
      type: 'application/octet-stream',
    });

    const input = screen.getByLabelText('SELECT FILE') as HTMLInputElement;

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('super-mario.nes')).toBeInTheDocument();
    });
  });

  it('should auto-extract title from filename', async () => {
    render(<RomUpload />);

    const file = new File(['test'], 'Super Mario Bros.nes', {
      type: 'application/octet-stream',
    });

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/GAME TITLE/i) as HTMLInputElement;
      expect(titleInput.value).toBe('Super Mario Bros');
    });
  });

  it('should validate required fields', async () => {
    render(<RomUpload />);

    const submitButton = screen.getByText('UPLOAD ROM');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please fill in all required fields')
      ).toBeInTheDocument();
    });
  });

  it('should upload ROM successfully', async () => {
    const onComplete = vi.fn();

    vi.mocked(api.gameApi.uploadRom).mockResolvedValue({
      status: 'success',
      data: {
        game: {
          id: '1',
          title: 'Test Game',
          system: 'nes',
          romPath: 'roms/nes/test.nes',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
    });

    render(<RomUpload onUploadComplete={onComplete} />);

    // Select file
    const file = new File(['test'], 'test-game.nes', {
      type: 'application/octet-stream',
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    // Fill title
    const titleInput = screen.getByLabelText(/GAME TITLE/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Test Game');

    // Select system
    const systemSelect = screen.getByLabelText(/SYSTEM/i);
    await userEvent.selectOptions(systemSelect, 'nes');

    // Submit
    const submitButton = screen.getByText('UPLOAD ROM');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.gameApi.uploadRom).toHaveBeenCalledWith(
        expect.any(File),
        {
          title: 'Test Game',
          system: 'nes',
          description: undefined,
        },
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/uploaded successfully/i)).toBeInTheDocument();
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should show upload progress', async () => {
    let progressCallback: ((event: any) => void) | undefined;

    vi.mocked(api.gameApi.uploadRom).mockImplementation(
      async (_file, _metadata, onProgress) => {
        progressCallback = onProgress;
        return new Promise(() => {}); // Never resolves
      }
    );

    render(<RomUpload />);

    // Setup and submit form
    const file = new File(['test'], 'test.nes', {
      type: 'application/octet-stream',
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    const titleInput = screen.getByLabelText(/GAME TITLE/i);
    await userEvent.type(titleInput, 'Test');

    const systemSelect = screen.getByLabelText(/SYSTEM/i);
    await userEvent.selectOptions(systemSelect, 'nes');

    const submitButton = screen.getByText('UPLOAD ROM');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('UPLOADING...')).toBeInTheDocument();
    });

    // Simulate progress
    if (progressCallback) {
      progressCallback({ loaded: 50, total: 100 });
    }

    await waitFor(() => {
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });
  });

  it('should show error on upload failure', async () => {
    vi.mocked(api.gameApi.uploadRom).mockRejectedValue({
      response: { data: { message: 'Upload failed' } },
    });

    render(<RomUpload />);

    // Setup and submit
    const file = new File(['test'], 'test.nes', {
      type: 'application/octet-stream',
    });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    const titleInput = screen.getByLabelText(/GAME TITLE/i);
    await userEvent.type(titleInput, 'Test');

    const systemSelect = screen.getByLabelText(/SYSTEM/i);
    await userEvent.selectOptions(systemSelect, 'nes');

    const submitButton = screen.getByText('UPLOAD ROM');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });
  });

  it('should support drag and drop', async () => {
    render(<RomUpload />);

    const dropzone = screen.getByText(/Drag & Drop ROM file here/i).closest('div');

    const file = new File(['test'], 'dragged-game.nes', {
      type: 'application/octet-stream',
    });

    const dragEvent = {
      dataTransfer: {
        files: [file],
      },
    };

    fireEvent.dragEnter(dropzone!, dragEvent);
    fireEvent.drop(dropzone!, dragEvent);

    await waitFor(() => {
      expect(screen.getByText('dragged-game.nes')).toBeInTheDocument();
    });
  });
});
