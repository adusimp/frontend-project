'use client';
import React, { useState, useEffect } from 'react';

type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type NoteModalProps = {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  selectedNote: Note | null;
  setSelectedNote: (v: Note | null) => void;
  onSave: (note: Note) => Promise<void>; // 👈 gọi API PUT/POST
  onDelete:(id:number) => void
};

export default function NoteModal({
  showModal,
  setShowModal,
  selectedNote,
  setSelectedNote,
  onSave,
  onDelete
}: NoteModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setIsEditing(false);
    }
  }, [selectedNote]);
  

  if (!showModal || !selectedNote) return null;

  const onClose = () => {
    setShowModal(false);
    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleDelete=()=>{
    if (confirm("Bạn có chắc chắn muốn xóa note này?")) {
   onDelete(selectedNote.id);
  onClose();
}
  }
  const handleSave = async () => {
    await onSave({
      ...selectedNote,
      id:selectedNote.id,
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Nền mờ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal nội dung */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6 animate-fadeIn">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded-lg p-2 mb-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề..."
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border rounded-lg p-2 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nội dung..."
            />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {selectedNote.title}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {selectedNote.content}
            </p>
          </>
        )}

        <div className="text-sm text-gray-400 mb-4">
          🕓 Tạo lúc: {new Date(selectedNote.createdAt).toLocaleString()}
        </div>

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Lưu
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sửa
              </button>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Đóng
              </button>
                <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Xóa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
