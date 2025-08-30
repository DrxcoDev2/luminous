'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { getTeam } from "@/lib/firestore";
import type { TeamMember } from "@/types/team";

export default function ChatPage() {
    const { user } = useAuth();
    const [/*search*/, setSearch] = useState('');
    const [/*users*/, setUsers] = useState<TeamMember[]>([]);
    const [/*loading*/, setLoading] = useState(true);
    const [/*error*/, setError] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const fetchedUsers = await getTeam(user!.uid);
                setUsers(fetchedUsers.members);
            } catch (error) {
                console.error('Failed to fetch users', error);
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [user]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearch(e.currentTarget.search.value);
        
    };
  return (
    <div >
      <div className="flex p-6 px-12">
        <div className="">
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input type="text" name="search" placeholder="Search user"/>
                <Button type="submit"><Search /></Button>
            </form>
        </div>
      </div>
    </div>
  );
}