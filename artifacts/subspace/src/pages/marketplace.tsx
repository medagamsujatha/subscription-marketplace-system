import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { useListSubscriptions, useListCategories } from "@workspace/api-client-react";
import { ServiceCard } from "@/components/service-card";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "price" | "rating" | "name">("newest");

  const { data: services, isLoading } = useListSubscriptions({
    search: search || undefined,
    category: category || undefined,
    sortBy
  });

  const { data: categories } = useListCategories();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-sidebar text-white shadow-2xl">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Abstract Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar via-sidebar/80 to-transparent" />
        
        <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4"
          >
            Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-primary">Superpower</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-sidebar-foreground/80 mb-8"
          >
            Explore the best software subscriptions, tools, and services to supercharge your workflow. All in one place.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex items-center max-w-xl"
          >
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search for tools, categories, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-xl transition-all"
            />
          </motion.div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 hide-scrollbar">
          <Filter className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <button 
            onClick={() => setCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!category ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            All Services
          </button>
          {categories?.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === cat.slug ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center shrink-0 w-full sm:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto bg-transparent border-none text-sm font-medium text-foreground focus:ring-0 cursor-pointer appearance-none pr-8 py-2"
          >
            <option value="newest">Newest Added</option>
            <option value="rating">Highest Rated</option>
            <option value="price">Price: Low to High</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-card rounded-2xl h-80 animate-pulse border border-border" />
          ))}
        </div>
      ) : services?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-3xl border border-border border-dashed">
          <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="Empty" className="w-48 h-48 mx-auto mb-6 opacity-80 mix-blend-multiply" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No services found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">We couldn't find anything matching your current filters. Try adjusting your search.</p>
          <button 
            onClick={() => { setSearch(""); setCategory(""); }}
            className="mt-6 px-6 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {services?.map(service => (
            <motion.div 
              key={service.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
