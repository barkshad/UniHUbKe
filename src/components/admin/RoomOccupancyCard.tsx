import React from 'react';
import { HostelRoom } from '../../types';
import { motion } from 'motion/react';
import { Edit2, Trash2, Video, Image as ImageIcon } from 'lucide-react';

interface RoomOccupancyCardProps {
  key?: string | number;
  room: HostelRoom;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: HostelRoom['status']) => void;
}

export default function RoomOccupancyCard({
  room,
  index,
  onEdit,
  onDelete,
  onStatusChange,
}: RoomOccupancyCardProps) {
  const occupancyPercentage = room.occupancy?.occupancy_percentage ?? 0;

  const getStatusColor = (status: HostelRoom['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'booked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold">Room {room.room_number}</h3>
            {room.bed_number && (
              <p className="text-sm text-neutral-500">{room.bed_number}</p>
            )}
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={onEdit}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {room.room_type.replace('_', ' ')}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <select
            value={room.status}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${getStatusColor(room.status)}`}
          >
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Occupancy Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Occupancy</span>
            <span className="text-sm font-bold">
              {room.occupancy?.current_occupants ?? 0}/{room.occupancy?.max_occupants ?? 1}
            </span>
          </div>
          <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all ${
                occupancyPercentage === 100 ? 'bg-red-600' : 'bg-green-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {occupancyPercentage.toFixed(0)}% occupied
          </p>
        </div>

        {/* Pricing */}
        {room.pricing && (
          <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg space-y-2">
            {room.pricing.per_month ? (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Monthly</span>
                <span className="font-semibold">KES {room.pricing.per_month.toLocaleString()}</span>
              </div>
            ) : null}
            {room.pricing.per_semester ? (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Semester</span>
                <span className="font-semibold">KES {room.pricing.per_semester.toLocaleString()}</span>
              </div>
            ) : null}
            {room.pricing.per_year ? (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Yearly</span>
                <span className="font-semibold">KES {room.pricing.per_year.toLocaleString()}</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Media Count */}
        {room.media && room.media.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <p className="text-sm font-medium mb-2">Media</p>
            <div className="flex gap-4">
              {room.media.filter(m => m.type === 'video').length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>
                    {room.media.filter(m => m.type === 'video').length} video
                    {room.media.filter(m => m.type === 'video').length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {room.media.filter(m => m.type === 'image').length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                  <span>
                    {room.media.filter(m => m.type === 'image').length} photo
                    {room.media.filter(m => m.type === 'image').length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <p className="text-sm font-medium mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
