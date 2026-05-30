import React, { useState, useEffect } from 'react';
import { HostelRoom, Hostel } from '../../types';
import { getHostelRooms, getHostel } from '../../services/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Users, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { HLSVideoPlayer } from '../../components/HLSVideoPlayer';

export const HostelDetailsPage = () => {
  const { id } = useParams();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [hData, rData] = await Promise.all([
          getHostel(id),
          getHostelRooms(id)
        ]);
        setHostel(hData);
        setRooms(rData);
        if (rData.length > 0) setSelectedRoom(rData[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const filteredRooms = filterType === 'all' 
    ? rooms 
    : rooms.filter(r => r.room_type === filterType);

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (!hostel) return <div className="text-center py-8 text-white">Hostel not found</div>;

  return (
    <div className="min-h-screen bg-surface-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/hostels" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hostels
        </Link>
        
        {/* Selected Room Detail */}
        {selectedRoom ? (
          <div className="mb-12 grid md:grid-cols-2 gap-8">
            
            {/* Media Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {selectedRoom.media && selectedRoom.media.length > 0 ? (
                <>
                  <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                    {selectedRoom.media[0].type === 'video' ? (
                      <HLSVideoPlayer
                        src={selectedRoom.media[0].url}
                        controls
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={selectedRoom.media[0].url}
                        alt="Room"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {selectedRoom.media.map((media, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => {
                          const reordered = [media, ...selectedRoom.media!.filter((_, i) => i !== idx)];
                          setSelectedRoom({ ...selectedRoom, media: reordered });
                        }}
                        className="aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-white transition-all"
                        whileHover={{ scale: 1.05 }}
                      >
                        {media.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <Video className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                  No media available for this room
                </div>
              )}
            </motion.div>

            {/* Room Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-display font-medium text-white mb-2">
                  Room {selectedRoom.room_number}
                </h1>
                {selectedRoom.bed_number && (
                  <p className="text-lg text-zinc-400">
                    {selectedRoom.bed_number}
                  </p>
                )}
              </div>

              <div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedRoom.status === 'available'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {selectedRoom.status === 'available' ? 'Available' : 'Occupied / Unavailable'}
                </span>
              </div>

              {selectedRoom.pricing && (
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-3">
                  <h3 className="font-medium text-white mb-4">Pricing</h3>
                  {selectedRoom.pricing.per_month ? (
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Monthly</span>
                      <span className="text-xl font-bold text-white">
                        KSh {selectedRoom.pricing.per_month.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                  {selectedRoom.pricing.per_semester ? (
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Per Semester</span>
                      <span className="text-xl font-bold text-white">
                        KSh {selectedRoom.pricing.per_semester.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                  {selectedRoom.pricing.per_year ? (
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Per Year</span>
                      <span className="text-xl font-bold text-white">
                        KSh {selectedRoom.pricing.per_year.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="font-medium text-white mb-4">Occupancy</h3>
                <div className="flex items-center justify-between mb-3 text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {selectedRoom.occupancy?.current_occupants ?? 0}/{selectedRoom.occupancy?.max_occupants ?? 1}
                  </span>
                  <span className="font-bold text-white">
                    {selectedRoom.occupancy?.occupancy_percentage.toFixed(0) ?? 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500"
                    style={{ width: `${selectedRoom.occupancy?.occupancy_percentage ?? 0}%` }}
                  />
                </div>
              </div>

              {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                <div>
                  <h3 className="font-medium text-white mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                className="w-full px-6 py-4 bg-brand-500 text-black font-semibold rounded-xl hover:bg-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Contact Warden
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-400">No rooms have been added to this hostel yet.</div>
        )}

        {/* Room Selection Grid */}
        {rooms.length > 0 && (
          <div className="mt-16 border-t border-zinc-800 pt-12">
            <h2 className="text-2xl font-display font-medium text-white mb-6">Other Rooms in {hostel.name}</h2>

            <div className="mb-8 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All Rooms ({rooms.length})
              </button>
              {['single', 'shared_double', 'shared_quad', 'shared_open'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                    filterType === type
                      ? 'bg-white text-black'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {type.replace('_', ' ')} ({rooms.filter(r => r.room_type === type).length})
                </button>
              ))}
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              <AnimatePresence>
                {filteredRooms.map((room, idx) => (
                  <motion.button
                    key={room.id}
                    onClick={() => {
                        setSelectedRoom(room);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedRoom?.id === room.id
                        ? 'border-brand-500 bg-zinc-900'
                        : 'border-zinc-800 bg-surface-900 hover:border-zinc-600'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {room.media && room.media[0] ? (
                      <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-4 border border-zinc-800">
                        {room.media[0].type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <img
                            src={room.media[0].url}
                            alt="Room"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-4 border border-zinc-800" />
                    )}

                    <h3 className="font-bold text-white text-lg">Room {room.room_number}</h3>
                    {room.bed_number && (
                      <p className="text-sm text-zinc-400 mb-3">{room.bed_number}</p>
                    )}

                    <div className="space-y-2 text-sm mt-3 border-t border-zinc-800 pt-3">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="capitalize">{room.room_type.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          room.status === 'available'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {room.status}
                        </span>
                      </div>

                      {room.pricing?.per_month ? (
                        <div className="flex justify-between font-bold text-white mt-2">
                          <span className="text-zinc-400 font-normal">Monthly:</span>
                          <span>KSh {room.pricing.per_month.toLocaleString()}</span>
                        </div>
                      ) : room.pricing?.per_semester ? (
                        <div className="flex justify-between font-bold text-white mt-2">
                          <span className="text-zinc-400 font-normal">Semester:</span>
                          <span>KSh {room.pricing.per_semester.toLocaleString()}</span>
                        </div>
                      ) : null}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
