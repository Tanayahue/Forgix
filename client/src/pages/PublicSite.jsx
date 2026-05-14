import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { serverUrl } from "../config/api";

function PublicSite() {
  const { slug } = useParams();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await axios.get(`${serverUrl}/api/website/site/${slug}`);
        setWebsite(result.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load website");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchWebsite();
    }
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-white text-black flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white text-red-600 flex items-center justify-center">{error}</div>;
  }

  return (
    <iframe
      title={website?.title || "Website"}
      srcDoc={website?.latestCode || ""}
      className="h-screen w-screen border-0"
    />
  );
}

export default PublicSite;
