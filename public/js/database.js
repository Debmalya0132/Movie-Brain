// ── Database Layer (Supabase + LocalStorage) ───────────────────────────

const DB = {
    // ── Get All Content ──
    async getWatchedContent() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (session) {
            console.log("☁️ Fetching from Supabase...");
            const { data, error } = await window.supabaseClient
                .from('watched_content')
                .select('*')
                .order('watched_at', { ascending: false });
            
            if (error) {
                console.error("Supabase Fetch Error:", error);
                return this.getLocal();
            }
            
            // Map Supabase field names to app field names
            return data.map(item => ({
                id: item.movie_id,
                title: item.title,
                type: item.type,
                year: item.year,
                genres: item.genres,
                rating: item.rating,
                posterPath: item.poster_path,
                overview: item.overview,
                dateAdded: item.watched_at
            }));
        } else {
            console.log("🏠 Fetching from LocalStorage...");
            return this.getLocal();
        }
    },

    // ── Add Item ──
    async addWatchedItem(item) {
        const { data: { session } } = await window.supabaseClient.auth.getSession();

        if (session) {
            console.log("☁️ Saving to Supabase...");
            const { error } = await window.supabaseClient
                .from('watched_content')
                .insert([{
                    user_id: session.user.id,
                    movie_id: item.id,
                    title: item.title,
                    type: item.type,
                    year: item.year,
                    genres: item.genres,
                    poster_path: item.posterPath,
                    rating: item.rating,
                    overview: item.overview
                }]);
            
            if (error) {
                if (error.code === '23505') return; // Duplicate movie for this user
                console.error("Supabase Save Error:", error);
            }
        } else {
            console.log("🏠 Saving to LocalStorage...");
            const local = this.getLocal();
            local.unshift(item);
            this.setLocal(local);
        }
    },

    // ── Remove Item ──
    async removeWatchedItem(movieId) {
        const { data: { session } } = await window.supabaseClient.auth.getSession();

        if (session) {
            console.log("☁️ Removing from Supabase...");
            const { error } = await window.supabaseClient
                .from('watched_content')
                .delete()
                .eq('user_id', session.user.id)
                .eq('movie_id', movieId);
            
            if (error) console.error("Supabase Delete Error:", error);
        } else {
            console.log("🏠 Removing from LocalStorage...");
            const local = this.getLocal();
            const filtered = local.filter(m => m.id !== movieId);
            this.setLocal(filtered);
        }
    },

    // ── Helper: LocalStorage ──
    getLocal() {
        const data = localStorage.getItem('movieBrainData');
        return data ? JSON.parse(data) : [];
    },

    setLocal(data) {
        localStorage.setItem('movieBrainData', JSON.stringify(data));
    }
};
