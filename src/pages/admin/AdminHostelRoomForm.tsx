import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HostelRoom } from '../../types';
import { getHostelRoom, createHostelRoom, updateHostelRoom } from '../../services/firestore';
import { Upload, X, Video, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export const AdminHostelRoomForm = () => {
  const { id: hostelId, roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!roomId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      room_number: '',
      room_type: 'single',
      bed_number: '',
      max_occupants: 1,
      current_occupants: 0,
      pricing_per_month: 0,
      pricing_per_semester: 0,
      pricing_per_year: 0,
      status: 'available',
      amenities: '',
    },
  });

  useEffect(() => {
    if (roomId) {
      getHostelRoom(roomId).then(data => {
        if (data) {
          reset({
            room_number: data.room_number,
            room_type: data.room_type,
            bed_number: data.bed_number || '',
            max_occupants: data.occupancy?.max_occupants || 1,
            current_occupants: data.occupancy?.current_occupants || 0,
            pricing_per_month: data.pricing?.per_month || 0,
            pricing_per_semester: data.pricing?.per_semester || 0,
            pricing_per_year: data.pricing?.per_year || 0,
            status: data.status,
            amenities: data.amenities?.join(', ') || '',
          });
          setMediaItems(data.media || []);
        }
        setLoading(false);
      }).catch(err => {
        toast.error('Failed to load room details');
        navigate(`/admin/hostels/${hostelId}/rooms`);
      });
    }
  }, [roomId, hostelId, navigate, reset]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingMedia(true);
    const loadingId = toast.loading('Uploading media...');

    try {
      const { uploadToCloudinary } = await import('../../lib/cloudinary');
      
      const newItems = [];
      for (const file of Array.from(files) as File[]) {
        const isVideo = file.type.startsWith('video');
        const url = await uploadToCloudinary(file);
        newItems.push({
          type: isVideo ? 'video' : 'image',
          url: url,
          caption: '',
          order: mediaItems.length + newItems.length,
          ...(isVideo && { duration: 0, thumbnail: url }),
        });
      }

      setMediaItems([...mediaItems, ...newItems]);
      toast.success('Media added', { id: loadingId });
    } catch (err) {
      toast.error('Upload failed', { id: loadingId });
    } finally {
      setUploadingMedia(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!hostelId) return;
    setIsSubmitting(true);

    try {
      const roomData: Omit<HostelRoom, 'id' | 'createdAt' | 'updatedAt'> = {
        hostelId,
        room_number: data.room_number,
        room_type: data.room_type as any,
        bed_number: data.bed_number || undefined,
        pricing: {
          per_month: parseFloat(data.pricing_per_month),
          per_semester: parseFloat(data.pricing_per_semester),
          per_year: parseFloat(data.pricing_per_year),
        },
        status: data.status,
        occupancy: {
          current_occupants: parseInt(data.current_occupants),
          max_occupants: parseInt(data.max_occupants),
          occupancy_percentage: (parseInt(data.current_occupants) / parseInt(data.max_occupants)) * 100,
        },
        amenities: data.amenities.split(',').map((a: string) => a.trim()).filter((a: string) => a),
        media: mediaItems,
      };

      if (roomId) {
        await updateHostelRoom(roomId, roomData);
        toast.success('Room updated');
      } else {
        await createHostelRoom(roomData);
        toast.success('Room created');
      }

      navigate(`/admin/hostels/${hostelId}/rooms`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save room');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to={`/admin/hostels/${hostelId}/rooms`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Rooms
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {roomId ? 'Edit Room' : 'Add New Room'}
          </h2>
        </div>

        {/* Basic Info */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-white mb-4">Room Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Room Number *</label>
              <Controller
                name="room_number"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., 101"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              />
              {errors.room_number && (
                <p className="text-red-500 text-sm mt-1">{errors.room_number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Room Type *</label>
              <Controller
                name="room_type"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500">
                    <option value="single">Single</option>
                    <option value="shared_double">Shared Double</option>
                    <option value="shared_quad">Shared Quad</option>
                    <option value="shared_open">Shared Open</option>
                  </select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Bed Number</label>
              <Controller
                name="bed_number"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., Bed 1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Status *</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500">
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-white mb-4">Occupancy</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Max Occupants</label>
              <Controller
                name="max_occupants"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Current Occupants</label>
              <Controller
                name="current_occupants"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-white mb-4">Pricing (KSh)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Per Month</label>
              <Controller
                name="pricing_per_month"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Per Semester</label>
              <Controller
                name="pricing_per_semester"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Per Year</label>
              <Controller
                name="pricing_per_year"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-white mb-4">Amenities (Comma separated)</h3>
          <Controller
            name="amenities"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="WiFi, Hot Shower, Study Desk..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                rows={3}
              />
            )}
          />
        </div>

        {/* Media Upload */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h3 className="font-semibold text-white mb-4">Room Media</h3>
          
          <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center cursor-pointer hover:bg-zinc-800/50 transition-colors relative">
            <input
              type="file"
              multiple
              accept="video/*,image/*"
              onChange={handleMediaUpload}
              disabled={uploadingMedia}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
            <p className="font-medium text-white">{uploadingMedia ? 'Uploading...' : 'Click or Drag to upload media'}</p>
            <p className="text-sm text-zinc-500">Videos and photos supported</p>
          </div>

          <AnimatePresence>
            {mediaItems.length > 0 && (
              <div className="space-y-3 mt-4">
                {mediaItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded overflow-hidden">
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {item.type === 'video' ? 'Video' : 'Photo'}
                      </p>
                      <input
                        type="text"
                        placeholder="Add caption..."
                        value={item.caption || ''}
                        onChange={(e) => {
                          const updated = [...mediaItems];
                          updated[idx].caption = e.target.value;
                          setMediaItems(updated);
                        }}
                        className="text-xs mt-1 w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== idx))}
                      className="p-2 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <Link
            to={`/admin/hostels/${hostelId}/rooms`}
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-brand-500 text-black rounded-lg font-semibold hover:bg-white disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Saving...' : 'Save Room'}
          </button>
        </div>
      </form>
    </div>
  );
};
