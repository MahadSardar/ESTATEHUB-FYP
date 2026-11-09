import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Upload, Trash2, Star } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [txnType, setTxnType] = useState("sale");
  const [propertyType, setPropertyType] = useState("house");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("sqft");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [media, setMedia] = useState([]); // files already uploaded
  const [files, setFiles] = useState([]); // new files to add
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // load the listing and fill the form
  const loadListing = async () => {
    try {
      const res = await api.get("/listings/my");
      const l = res.data.listings.find((item) => item._id === id);

      if (!l) {
        toast.error("Listing not found");
        return navigate("/my-listings");
      }

      setTitle(l.title);
      setDescription(l.description);
      setPrice(l.price);
      setTxnType(l.txnType);
      setPropertyType(l.propertyType);
      setCity(l.city);
      setLocality(l.locality);
      setAddress(l.address || "");
      setArea(l.area);
      setAreaUnit(l.areaUnit);
      setBedrooms(l.bedrooms);
      setBathrooms(l.bathrooms);
      if (l.location?.coordinates?.length === 2) {
        setLng(l.location.coordinates[0]);
        setLat(l.location.coordinates[1]);
      }
      setMedia(l.media);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load listing");
    }
    setPageLoading(false);
  };

  useEffect(() => {
    loadListing();
  }, []);

  // reload only the media list (after delete or set cover)
  const reloadMedia = async () => {
    try {
      const res = await api.get("/listings/my");
      const l = res.data.listings.find((item) => item._id === id);
      if (l) setMedia(l.media);
    } catch (error) {
      toast.error("Could not refresh files");
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const res = await api.delete(`/listings/${id}/media/${mediaId}`);
      toast.success(res.data.message);
      reloadMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleSetCover = async (mediaId) => {
    try {
      const res = await api.patch(`/listings/${id}/media/${mediaId}/cover`);
      toast.success(res.data.message);
      reloadMedia();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (media.length + files.length > 10) {
      return toast.error("A listing can have 10 files at most");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("txnType", txnType);
    formData.append("propertyType", propertyType);
    formData.append("city", city);
    formData.append("locality", locality);
    formData.append("address", address);
    formData.append("area", area);
    formData.append("areaUnit", areaUnit);
    formData.append("bedrooms", bedrooms);
    formData.append("bathrooms", bathrooms);
    formData.append("lat", lat);
    formData.append("lng", lng);
    files.forEach((file) => formData.append("media", file));

    setLoading(true);
    try {
      const res = await api.put(`/listings/${id}`, formData);
      toast.success(res.data.message);
      navigate("/my-listings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600 sm:text-base";
  const label = "mb-1 block text-sm font-medium text-slate-700";

  if (pageLoading) {
    return (
      <div className="flex min-h-[calc(100vh-61px)] items-center justify-center bg-slate-100 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Pencil className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Edit property</h1>
        </div>

        {/* current photos and videos */}
        <div className="mb-6">
          <label className={label}>Current photos and videos</label>
          {media.length === 0 ? (
            <p className="text-sm text-slate-500">No files yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {media.map((m) => (
                <div key={m._id} className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="relative h-28 bg-slate-200 sm:h-32">
                    {m.type === "image" ? (
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <video src={m.url} className="h-full w-full object-cover" />
                    )}
                    {m.isCover && (
                      <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                        Cover
                      </span>
                    )}
                  </div>
                  <div className="flex">
                    {m.type === "image" && !m.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(m._id)}
                        className="flex flex-1 items-center justify-center gap-1 py-2 text-xs text-blue-600 hover:bg-slate-100"
                      >
                        <Star size={14} /> Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(m._id)}
                      className="flex flex-1 items-center justify-center gap-1 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={input}
              required
            />
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={input}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={label}>Price (PKR)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={input}
                required
              />
            </div>
            <div>
              <label className={label}>For</label>
              <select
                value={txnType}
                onChange={(e) => setTxnType(e.target.value)}
                className={input}
              >
                <option value="sale">Sale</option>
                <option value="rent_long">Rent (long term)</option>
                <option value="rent_short">Rent (short term)</option>
              </select>
            </div>
            <div>
              <label className={label}>Property type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={input}
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
                <option value="room">Room</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={input}
                required
              />
            </div>
            <div>
              <label className={label}>Locality</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className={input}
                required
              />
            </div>
          </div>

          <div>
            <label className={label}>Address (optional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={input}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className={label}>Area</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={input}
                  required
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 text-sm outline-none focus:border-blue-600"
                >
                  <option value="sqft">sqft</option>
                  <option value="marla">marla</option>
                  <option value="kanal">kanal</option>
                  <option value="sqyd">sqyd</option>
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Bedrooms</label>
              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Bathrooms</label>
              <input
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={input}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>Latitude (optional)</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Longitude (optional)</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={input}
              />
            </div>
          </div>

          <div>
            <label className={label}>Add more photos or videos</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-6 text-slate-500 transition hover:border-blue-600 hover:text-blue-600">
              <Upload size={28} />
              <span className="text-sm">Click to choose files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="hidden"
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {files.map((file, i) => (
                  <li key={i} className="truncate">
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/my-listings")}
              className="w-full rounded-lg border border-slate-300 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;