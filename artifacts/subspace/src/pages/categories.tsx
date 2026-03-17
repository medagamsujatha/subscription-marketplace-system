import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-card rounded-3xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/pattern-dots.png`} 
          alt="Pattern" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">Browse by Category</h1>
          <p className="text-lg text-muted-foreground">Find exactly the tools your business needs by exploring our curated taxonomy of software services.</p>
        </div>
      </div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {categories?.map((cat, i) => (
          <motion.div
            key={cat.id}
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              show: { opacity: 1, scale: 1 }
            }}
          >
            <Link href={`/?category=${cat.slug}`} className="block h-full group">
              <div className="bg-card h-full p-6 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm relative z-10">
                  <Layers className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 relative z-10">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1 relative z-10">{cat.description}</p>
                
                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between relative z-10 text-sm font-medium">
                  <span className="text-muted-foreground">{cat.serviceCount} services</span>
                  <span className="text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
