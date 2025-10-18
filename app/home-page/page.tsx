'use client';

import { useEffect, useState } from 'react';
import NoteModal from '../components/noteModal';
import AddNoteModal from '../components/addNewNote';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { io } from 'socket.io-client';
const socket = io(process.env.NEXT_PUBLIC_API_URL as string);

export default function HomePage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false)

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const handleEdit = async (note: Note) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
        });
        fetchData(); // load lại danh sách
    };
    const handleDelete = async (id: number) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        fetchData(); // load lại danh sách
    }
    const handleSaveNote = async (title: string, content: string) => {
        const newNote = {
            title,
            content,
            user_id: 1, // 👈 user_id cố định (bạn có thể lấy từ state hoặc token sau)
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNote),
            });

            if (!res.ok) throw new Error('Lỗi khi thêm ghi chú');
            // Cập nhật list note hiển thị
            fetchData()
            setShowAddModal(false);
        } catch (err) {
            console.error(err);
            alert('Không thể thêm ghi chú. Vui lòng thử lại!');
        }
    };
    const fetchData = () => {
        fetch(`${API_URL}/post`)
            .then((res) => res.json())
            .then((data) => setNotes(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }
    useEffect(() => {
        fetchData()
    }, [API_URL]);
    useEffect(() => {
        fetchData();

        // Lắng nghe từ server khi có người khác kéo thả
        socket.on('orderUpdated', (newNotes: Note[]) => {
            setNotes(newNotes);
        });

        return () => {
            socket.off('orderUpdated');
        };
    }, []);
     useEffect(() => {
        socket.on('notesUpdated', () => {
            fetchData()
        });

        return () => {
            socket.off('notesUpdated');
        };
    }, []);
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newNotes = Array.from(notes);
        const [moved] = newNotes.splice(result.source.index, 1);
        newNotes.splice(result.destination.index, 0, moved);
        setNotes(newNotes);

        // gửi cho server để broadcast cho các client khác
        socket.emit('updateOrder', newNotes);
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500 text-lg animate-pulse">Đang tải dữ liệu...</p>
            </div>
        );

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600">
                    📒 Danh sách ghi chú
                </h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    ➕ Thêm mới
                </button>
            </div>

            {notes.length === 0 ? (
                <p className="text-center text-gray-500">Không có ghi chú nào.</p>
            ) : (

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="notes">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {notes.map((note, index) => (
                                    <Draggable
                                        key={note.id.toString()}
                                        draggableId={note.id.toString()}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                onClick={() => {
                                                    setShowDetailModal(true);
                                                    setSelectedNote(note);
                                                }}
                                                className={`bg-white shadow-lg rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition-all duration-300 ${snapshot.isDragging ? 'opacity-80 rotate-1' : ''
                                                    }`}
                                            >
                                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {note.title}
                                                </h2>
                                                <p className="text-gray-600 mb-4">{note.content}</p>
                                                <div className="text-sm text-gray-400">
                                                    <p>
                                                        🕓 Tạo: {new Date(note.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
            <NoteModal
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}
                setShowModal={setShowDetailModal}
                showModal={showDetailModal}
                onDelete={handleDelete}
                onSave={handleEdit}
            />
            <AddNoteModal
                setShowModal={setShowAddModal}
                showModal={showAddModal}
                onSave={handleSaveNote}
            />
        </main>
    );
}
