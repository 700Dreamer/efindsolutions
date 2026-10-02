"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AdminSidebar } from "../../components/AdminSidebar";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { getServiceImageUrl } from "../../lib/media";
import { 
  Wrench, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  X, 
  UploadCloud, 
  ImageIcon, 
  Image as LucideImage 
} from "lucide-react";

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("engraving");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadServices = async () => {
    try {
      const data = await fetchApi("/services?active_only=false");
      setServices(data);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login");
      return;
    }
    if (user && isAdmin) {
      loadServices();
    }
  }, [user, isAdmin, isLoading, router]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setName("");
    setSlug("");
    setCategory("engraving");
    setBasePrice("15000");
    setDescription("");
    setFeatures("Laser Precision, Fast Turnaround, Custom Artwork");
    setImagePath("");
    setSelectedFile(null);
    setFilePreview(null);
    setIsActive(true);
    setIsFeatured(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc: any) => {
    setEditingService(svc);
    setName(svc.name);
    setSlug(svc.slug);
    setCategory(svc.category || "general");
    setBasePrice(svc.base_price.toString());
    setDescription(svc.description);
    try {
      const feats = JSON.parse(svc.features || "[]");
      setFeatures(feats.join(", "));
    } catch {
      setFeatures(svc.features || "");
    }
    setImagePath(svc.image_path || svc.image || "");
    setSelectedFile(null);
    setFilePreview(null);
    setIsActive(svc.is_active);
    setIsFeatured(svc.is_featured);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const handleRemoveSelectedImage = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setImagePath("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service? Any uploaded image file will also be permanently deleted.")) return;
    try {
      await fetchApi(`/services/${id}`, { method: "DELETE" });
      await loadServices();
    } catch (err: any) {
      alert(err.message || "Failed to delete service");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const featArray = features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      let finalImagePath = imagePath.trim();

      // If admin selected a new image file from their device, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetchApi<{ url: string }>("/services/upload-image", {
          method: "POST",
          data: formData,
        });
        if (uploadRes && uploadRes.url) {
          finalImagePath = uploadRes.url;
        }
      }

      const payload = {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        category,
        base_price: Number(basePrice),
        description,
        features: JSON.stringify(featArray),
        image_path: finalImagePath || null,
        image: finalImagePath || null,
        is_active: isActive,
        is_featured: isFeatured,
      };

      if (editingService) {
        await fetchApi(`/services/${editingService.id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        await fetchApi("/services", {
          method: "POST",
          data: payload,
        });
      }

      await loadServices();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F7F5]">
      <AdminSidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-[1440px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#087FEF]">Craft Management</span>
            <h1 className="text-2xl font-bold text-zinc-900 mt-1">Services Catalog CRUD</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Manage services, dynamic imagery, pricing, and showcase status</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm flex items-center space-x-2 self-start sm:self-auto transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>

        <div className="bg-white rounded-[28px] border border-black/8 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F5] border-b border-black/5 text-zinc-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {services.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400">
                    No services found. Click &quot;Add New Service&quot; to create one.
                  </td>
                </tr>
              ) : (
                services.map((svc) => {
                  const resolvedImg = getServiceImageUrl(svc.image_path || svc.image, svc.category);

                  return (
                    <tr key={svc.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 border border-black/10 shadow-xs shrink-0">
                          <Image
                            src={resolvedImg}
                            alt={svc.name}
                            fill
                            className="object-cover"
                            unoptimized={resolvedImg.includes("localhost") || resolvedImg.includes("127.0.0.1")}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-zinc-900">
                        <p className="text-sm font-bold text-zinc-900">{svc.name}</p>
                        <span className="text-[11px] font-mono text-zinc-400">/{svc.slug}</span>
                      </td>
                      <td className="px-6 py-4 uppercase font-semibold text-zinc-600">
                        <span className="bg-[#EAF9FF] text-[#087FEF] px-2.5 py-1 rounded-full text-[10px] font-bold">
                          {svc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#087FEF]">
                        UGX {Number(svc.base_price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          svc.is_active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {svc.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {svc.is_featured ? (
                          <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md font-semibold text-[10px]">Featured</span>
                        ) : (
                          <span className="text-zinc-400 text-[10px]">Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(svc)}
                          title="Edit Service & Image"
                          className="p-2 rounded-full text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(svc.id)}
                          title="Delete Service"
                          className="p-2 rounded-full text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Service Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              {editingService ? "Edit Service & Image" : "Create New Craft Service"}
            </h3>
            <p className="text-xs text-zinc-500 mb-6">Manage craft details, pricing, and high-resolution service imagery</p>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Service Image Upload & Preview Section */}
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-black/8 space-y-3">
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  Service Showcase Image
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-zinc-200 border border-black/10 shadow-inner shrink-0 flex items-center justify-center">
                    {filePreview || imagePath ? (
                      <Image
                        src={filePreview || getServiceImageUrl(imagePath, category)}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex flex-col items-center text-zinc-400 text-[10px]">
                        <LucideImage className="w-6 h-6 mb-1 opacity-50" />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions & Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white border border-black/10 text-zinc-800 hover:bg-zinc-50 text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-[#087FEF]" />
                        <span>{selectedFile ? "Change Upload" : "Upload File"}</span>
                      </button>

                      {(filePreview || imagePath) && (
                        <button
                          type="button"
                          onClick={handleRemoveSelectedImage}
                          className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    {selectedFile && (
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}

                    <div>
                      <input
                        type="text"
                        placeholder="Or enter direct image URL (https://...)"
                        value={imagePath}
                        onChange={(e) => {
                          setImagePath(e.target.value);
                          if (selectedFile) {
                            setSelectedFile(null);
                            setFilePreview(null);
                          }
                        }}
                        className="w-full px-3 py-2 text-[11px] bg-white border border-black/10 rounded-xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Note: Uploading a new image will automatically clean up and delete the old image file from storage.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingService) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                    Base Price (UGX)
                  </label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                >
                  <option value="engraving">Laser Engraving</option>
                  <option value="embroidery">Embroidery</option>
                  <option value="tracking">GPS Tracking</option>
                  <option value="calligraphy">Calligraphy</option>
                  <option value="branding">Branding</option>
                  <option value="printing">Garment Printing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1.5">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Laser Precision, Bulk Discounts, 24h Turnaround"
                  className="w-full px-4 py-3 text-xs bg-[#F7F7F5] border border-black/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#087FEF]/30"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#087FEF]"
                  />
                  <span>Active Catalog Service</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#087FEF]"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3.5 rounded-full bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition-transform active:scale-98 disabled:opacity-50"
              >
                {submitting ? "Saving & Uploading..." : "Save Service Configuration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

