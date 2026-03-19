import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, X } from 'lucide-react';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, name: string, category?: string) => void;
  type: 'pecs' | 'media';
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose, onUpload, type }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = () => {
    if (!file || !name.trim()) return;
    onUpload(file, name.trim(), category.trim() || undefined);
    setFile(null);
    setPreview(null);
    setName('');
    setCategory('');
    onClose();
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {type === 'pecs' ? '📎 Добавить PECS' : '📁 Добавить медиа-файл'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Drop zone */}
          {!file ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground">Перетащите файл сюда</p>
              <p className="text-xs text-muted-foreground mt-1">или нажмите, чтобы выбрать</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="relative bg-muted/30 rounded-2xl p-4 border-2 border-border">
              <button onClick={clearFile} className="absolute top-2 right-2 p-1 bg-card rounded-full border border-border hover:bg-destructive/10 transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-40 object-contain rounded-xl" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center">
                  <Image className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 truncate font-medium">{file.name}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-semibold">Название</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Введите название..."
              className="rounded-xl h-11"
            />
          </div>

          {type === 'pecs' && (
            <div className="space-y-2">
              <Label className="font-semibold">Категория</Label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Например: Еда, Животные, Эмоции..."
                className="rounded-xl h-11"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">Отмена</Button>
          <Button onClick={handleSubmit} disabled={!file || !name.trim()} className="rounded-xl font-bold gap-2">
            <Upload className="h-4 w-4" /> Загрузить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
