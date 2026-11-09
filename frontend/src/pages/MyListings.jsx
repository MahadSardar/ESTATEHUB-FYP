import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, MapPin, BedDouble, Bath, Ruler, Home } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  inactive: "bg-slate-200 text-slate-600",
  sold: "bg-blue-100 text-blue-700",
  rented: "bg-blue-100 text-blue-700",
};

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await api.get("/listings/my");
      setListings(res.data.listings);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load listings");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      const res = await api.patch(`/listings/${id}/status`, { status });
      toast.success(res.data.message);
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      const res = await api.delete(`/listings/${id}`);
      toast.success(res.data.message);
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-61px)] items-center justify-center bg-slate-100 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Listings</h1>
          <Link
            to="/create-listing"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            + Post property
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <Home className="mx-auto mb-3 text-slate-400" size={40} />
            <p className="text-slate-600">You have not posted any property yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => {
              const cover = l.media.find((m) => m.isCover) || l.media.find((m) => m.type === "image");
              const canChange = l.status !== "pending" && l.status !== "rejected";

              return (
                <div key={l._id} className="overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg">
                  {/* image */}
                  <div className="relative h-48 bg-slate-200">
                    {cover ? (
                      <img src={cover.url} alt={l.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <Home size={40} />
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[l.status]}`}
                    >
                      {l.status}
                    </span>
                  </div>

                  {/* details */}
                  <div className="p-4">
                    <h2 className="truncate text-lg font-semibold text-slate-900">{l.title}</h2>
                    <p className="mt-1 text-xl font-bold text-blue-600">
                      PKR {Number(l.price).toLocaleString()}
                      {l.txnType !== "sale" && (
                        <span className="text-sm font-normal text-slate-500"> / month</span>
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={16} /> {l.locality}, {l.city}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <BedDouble size={16} /> {l.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath size={16} /> {l.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler size={16} /> {l.area} {l.areaUnit}
                      </span>
                    </div>

                    {/* status change */}
                    <div className="mt-4">
                      {canChange ? (
                        <select
                          value={l.status}
                          onChange={(e) => handleStatus(l._id, e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="sold">Sold</option>
                          <option value="rented">Rented</option>
                        </select>
                      ) : (
                        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">
                          {l.status === "pending"
                            ? "Waiting for admin approval"
                            : "Rejected by admin"}
                        </p>
                      )}
                    </div>

                    {/* buttons */}
                    <div className="mt-4 flex gap-3">
                      <Link
                        to={`/edit-listing/${l._id}`}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                      >
                        <Pencil size={16} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(l._id)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-300 py-2 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;