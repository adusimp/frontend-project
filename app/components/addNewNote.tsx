'use client';
import React, { useState } from 'react';

type AddNoteModalProps = {
    showModal: boolean;
    setShowModal: (v: boolean) => void;
    onSave: (title: string, content: string) => void;
};

export default function AddNoteModal({
    showModal,
    setShowModal,
    onSave,
}: AddNoteModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    if (!showModal) return null;
    const onClose = () => {
        setShowModal(false);
    }
    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
            return;
        }
        onSave(title, content);
        setTitle('');
        setContent('');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Nền mờ */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Hộp nội dung modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    ✏️ Thêm ghi chú mới
                </h2>

                <input
                    type="text"
                    placeholder="Nhập tiêu đề..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                    placeholder="Nhập nội dung..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
