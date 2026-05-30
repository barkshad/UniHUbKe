import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { HostelRoom, Hostel } from '../../types';
import { getHostelRooms, getHostel, deleteHostelRoom, updateHostelRoom } from '../../services/firestore';
import toast from 'react-hot-toast';
import RoomOccupancyCard from '../../components/admin/RoomOccupancyCard';
import { AnimatePresence, motion } from 'motion/react';

export const AdminHostelRoomsPage = () => {
  const { id: hostelId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hostelId) return;
      try {
        const [hData, rData] = await Promise.all([
          getHostel(hostelId),
          getHostelRooms(hostelId)
        ]);
        setHostel(hData);
        setRooms(rData);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hostelId]);

  const handleDelete = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await deleteHostelRoom(roomId);
      toast.success('Room deleted');
      setRooms(rooms.filter(r => r.id !== roomId));
    } catch (err) {
      toast.error('Failed to delete room');
    }
  };

  const handleStatusChange = async (roomId: string, status: any) => {
    try {
      await updateHostelRoom(roomId, { status });
      setRooms(rooms.map(r => r.id === roomId ? { ...r, status } : r));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!hostel) return <div className="p-8 text-white">Hostel not found</div>;

  return (
    <div className="p-8">
      <Link to="/admin/hostels" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Hostels
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">Rooms in {hostel.name}</h1>
          <p className="text-zinc-400">Manage individual room occupancy, pricing, and availability.</p>
        </div>
        <Link 
          to={`/admin/hostels/${hostelId}/rooms/new`}
          className="flex items-center gap-2 bg-brand-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Room
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {rooms.map((room, index) => (
            <RoomOccupancyCard
              key={room.id as string}
              room={room}
              index={index}
              onEdit={() => navigate(`/admin/hostels/${hostelId}/rooms/${room.id}`)}
              onDelete={() => handleDelete(room.id!)}
              onStatusChange={(status) => handleStatusChange(room.id!, status)}
            />
          ))}
          {rooms.length === 0 && (
             <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500 mb-2">No rooms added yet.</p>
                <Link to={`/admin/hostels/${hostelId}/rooms/new`} className="text-brand-500 hover:underline">Add your first room</Link>
             </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
