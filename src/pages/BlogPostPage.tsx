import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils/image";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  featured_image_url: string;
  tags: string[];
  status: string;
}

const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/public/blog/${postId}`);
        if (!response.ok) {
          setNotFound(true);
          return;
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  // Format the content (simple markdown-like rendering)
  const renderContent = (content: string) => {
    // Split by lines and process
    const lines = content.trim().split("\n");
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        continue;
      }

      // H1
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={key++} className="font-display text-4xl font-bold mb-6 mt-8">
            {line.substring(2)}
          </h1>
        );
      }
      // H2
      else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={key++} className="font-display text-3xl font-bold mb-4 mt-8">
            {line.substring(3)}
          </h2>
        );
      }
      // H3
      else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={key++} className="font-display text-2xl font-semibold mb-3 mt-6">
            {line.substring(4)}
          </h3>
        );
      }
      // Bold text with **
      else if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(
          <p key={key++} className="text-lg font-semibold mb-3 mt-4">
            {line.substring(2, line.length - 2)}
          </p>
        );
      }
      // List items
      else if (line.startsWith("- ")) {
        elements.push(
          <li key={key++} className="text-muted-foreground mb-2 ml-6">
            {line.substring(2)}
          </li>
        );
      }
      // Regular paragraph
      else {
        elements.push(
          <p key={key++} className="text-muted-foreground leading-relaxed mb-4">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button asChild variant="ghost" className="text-muted-foreground hover:bg-primary hover:text-black">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </motion.div>

        {/* Article Container */}
        <article className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {/* Featured Image */}
            <div className="h-96 rounded-2xl overflow-hidden mb-8 bg-muted">
              <img
                src={getImageUrl(post.featured_image_url)}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div className="glass rounded-2xl p-8 md:p-12">
              {renderContent(post.content)}
            </div>
          </motion.div>

          {/* Related Articles / CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/blog">
                View More Articles
              </Link>
            </Button>
          </motion.div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;
