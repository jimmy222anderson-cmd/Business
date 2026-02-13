import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blog";

const BlogSection = () => {
  // Get the latest 3 published posts
  const latestPosts = blogPosts
    .filter((post) => post.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Latest <span className="text-gradient">Insights</span>
            </h2>
            <p className="text-muted-foreground text-lg">Stay updated with the latest in satellite intelligence.</p>
          </div>
          <Button asChild variant="ghost" className="hidden md:flex text-primary">
            <Link to="/blog">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((article, i) => (
            <Link key={article.id} to={`/blog/${article.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl overflow-hidden group cursor-pointer hover-glow h-full"
              >
                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {article.tags[0]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button asChild variant="ghost" className="text-primary">
            <Link to="/blog">View All Articles <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
