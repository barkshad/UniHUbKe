import React, { useState } from 'react';
import { seedData } from '../../services/firestore';
import toast from 'react-hot-toast';
import { Database, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SeederPage = () => {
    const [seeding, setSeeding] = useState(false);

    const handleSeed = async () => {
        if (!window.confirm("This will add initial configuration data to Firestore. Proceed?")) return;
        setSeeding(true);
        try {
            await seedData();
            toast.success("Database seeded successfully!");
        } catch (e: any) {
            toast.error("Failed to seed: " + e.message);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 mt-12 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 text-orange-500 mx-auto">
                <Database className="w-8 h-8" />
            </div>
            
            <div className="text-center">
                <h1 className="text-3xl font-display font-medium mb-3">Database Seeder</h1>
                <p className="text-zinc-400 text-lg">Initialize your database with starting configuration</p>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex gap-4 text-orange-200">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
                <p>This action will write initial settings records to your Firestore database. It should only be run once during initial setup.</p>
            </div>

            <button 
                onClick={handleSeed}
                disabled={seeding}
                className="w-full bg-white text-black py-4 rounded-xl font-medium text-lg flex justify-center items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
                {seeding ? <Loader2 className="w-6 h-6 animate-spin" /> : "Run Seeder Now"}
            </button>

            <div className="text-center">
                <Link to="/admin" className="text-zinc-500 hover:text-white underline underline-offset-4">Return to Dashboard</Link>
            </div>
        </div>
    );
};
