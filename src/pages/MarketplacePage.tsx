import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  Heart, 
  Share2, 
  MapPin, 
  ShieldCheck, 
  DollarSign, 
  Send, 
  X, 
  Tag, 
  CheckCircle2, 
  AlertTriangle,
  Trash2,
  Edit,
  Sparkles
} from 'lucide-react';
import { 
  getMarketplaceItems, 
  createMarketplaceItem, 
  updateMarketplaceItem, 
  deleteMarketplaceItem, 
  toggleSaveListing, 
  sendMarketplaceInquiry, 
  getCurrentUser 
} from '../services/storage';
import { MarketplaceItem, MarketplaceCategory, ItemCondition } from '../types';
import { useToast } from '../components/common/Toast';
import { ConfirmModal } from '../components/common/ConfirmModal';
import confetti from 'canvas-confetti';

interface MarketplacePageProps {
  onNavigate: (page: string) => void;
  selectedItemId?: string;
  isCreateOpen?: boolean;
}

const CATEGORIES: MarketplaceCategory[] = [
  'Books and textbooks',
  'Electronics and accessories',
  'Hostel essentials',
  'Stationery',
  'Clothing and accessories',
  'Sports equipment',
  'Lab and academic supplies',
  'Miscellaneous student items',
];

const CONDITIONS: ItemCondition[] = ['New', 'Like new', 'Good', 'Acceptable'];

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ selectedItemId, isCreateOpen = false }) => {
  const items = getMarketplaceItems();
  const currentUser = getCurrentUser();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'my-listings' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Modals state
  const [activeDetailItem, setActiveDetailItem] = useState<MarketplaceItem | null>(() => {
    if (selectedItemId) {
      return items.find((i) => i.id === selectedItemId) || null;
    }
    return null;
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(isCreateOpen);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [deleteModalItemId, setDeleteModalItemId] = useState<string | null>(null);

  // Inquiry form fields
  const [inquiryMessage, setInquiryMessage] = useState('Hi! Is this item still available for campus pickup?');
  const [inquiryOfferPrice, setInquiryOfferPrice] = useState<number | ''>('');

  // Create Listing fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState<number>(25);
  const [newIsNegotiable, setNewIsNegotiable] = useState(true);
  const [newCategory, setNewCategory] = useState<MarketplaceCategory>('Books and textbooks');
  const [newCondition, setNewCondition] = useState<ItemCondition>('Like new');
  const [newPickupLocation, setNewPickupLocation] = useState('Central Library Lobby');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80');

  // Filtered listings
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'my-listings' && item.sellerId !== currentUser.id) return false;
      if (activeTab === 'saved' && !currentUser.savedListings.includes(item.id)) return false;

      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchCond = selectedCondition === 'All' || item.condition === selectedCondition;

      return matchSearch && matchCat && matchCond;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, activeTab, currentUser, searchQuery, selectedCategory, selectedCondition, sortBy]);

  // Handle Create Listing Submit
  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMarketplaceItem({
      title: newTitle,
      description: newDesc,
      price: Number(newPrice),
      isNegotiable: newIsNegotiable,
      category: newCategory,
      condition: newCondition,
      pickupLocation: newPickupLocation,
      images: [newImageUrl.trim() || 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'],
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerAvatar: currentUser.avatar,
      sellerCollege: currentUser.college,
      sellerRating: 5.0,
      status: 'Available',
    });

    setIsCreateModalOpen(false);
    confetti({ particleCount: 40, spread: 50 });
    showToast('Listing Active! 🛍️', `"${newTitle}" is now listed in the student marketplace.`, 'success');
  };

  // Handle Send Inquiry
  const handleSendInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailItem) return;

    const offer = typeof inquiryOfferPrice === 'number' ? inquiryOfferPrice : undefined;
    sendMarketplaceInquiry(activeDetailItem.id, inquiryMessage, offer);
    setIsInquiryModalOpen(false);
    showToast('Inquiry Sent! 💬', `Your message was delivered to ${activeDetailItem.sellerName}.`, 'success');
  };

  // Toggle Item Sold / Available
  const handleToggleStatus = (itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Sold' ? 'Available' : 'Sold';
    updateMarketplaceItem(itemId, { status: nextStatus as any });
    showToast('Status Updated', `Item marked as ${nextStatus}.`, 'info');
  };

  // Delete Listing
  const handleConfirmDelete = () => {
    if (!deleteModalItemId) return;
    deleteMarketplaceItem(deleteModalItemId);
    setDeleteModalItemId(null);
    showToast('Listing Deleted', 'Your marketplace listing was removed.', 'info');
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Campus Marketplace
            </h1>
            <span className="badge badge-indigo">MODULE D</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Peer-to-peer student gear, textbooks, lab equipment, and hostel essentials traded safely on campus.
          </p>
        </div>

        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> List an Item
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        <ShieldCheck size={20} color="var(--success)" flex-shrink={0} />
        <span>
          <strong>Campus Safety Guidelines:</strong> Always arrange handoffs in public campus locations (e.g. Central Library lobby or Student Activity Center). Inspect items in person prior to payment.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '0 8px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Explore All ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('my-listings')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'my-listings' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'my-listings' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          My Listings ({items.filter((i) => i.sellerId === currentUser.id).length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'saved' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'saved' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Saved Favorites ({currentUser.savedListings.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '14px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search items, textbooks, gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ minWidth: '140px' }}>
            <select className="select-field" value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
              <option value="All">All Conditions</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select className="select-field" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '10px', paddingBottom: '2px' }}>
          <button
            className={`chip ${selectedCategory === 'All' ? 'chip-active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? 'chip-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {filteredItems.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <ShoppingBag size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No marketplace items found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Try clearing your filters or be the first to list an item!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
          {filteredItems.map((item) => {
            const isSaved = currentUser.savedListings.includes(item.id);
            const isOwner = item.sellerId === currentUser.id;
            const isSold = item.status === 'Sold';

            return (
              <div key={item.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span className={`badge ${isSold ? 'badge-neutral' : 'badge-emerald'}`}>
                      {isSold ? 'Sold' : 'Available'}
                    </span>
                  </div>

                  {/* Save Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveListing(item.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                    }}
                    title={isSaved ? 'Remove from saved' : 'Save item'}
                  >
                    <Heart size={16} color={isSaved ? '#EF4444' : 'var(--text-main)'} fill={isSaved ? '#EF4444' : 'none'} />
                  </button>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ${item.price}
                      </span>
                      {item.isNegotiable && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>OBO</span>
                      )}
                    </div>
                    <span className="badge badge-neutral">{item.condition}</span>
                  </div>

                  <h3
                    style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '6px', cursor: 'pointer' }}
                    onClick={() => setActiveDetailItem(item)}
                  >
                    {item.title}
                  </h3>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.pickupLocation}</span>
                  </div>

                  {/* Seller & Action */}
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src={item.sellerAvatar} alt={item.sellerName} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.sellerName}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isOwner ? (
                        <>
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                          >
                            {item.status === 'Sold' ? 'Mark Available' : 'Mark Sold'}
                          </button>
                          <button
                            onClick={() => setDeleteModalItemId(item.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--error)', padding: '4px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveDetailItem(item);
                            setIsInquiryModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          Inquire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Listing Detail Modal */}
      {activeDetailItem && !isInquiryModalOpen && (
        <div className="modal-overlay" onClick={() => setActiveDetailItem(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <img
                src={activeDetailItem.images[0]}
                alt={activeDetailItem.title}
                style={{ width: '100%', height: '260px', objectFit: 'cover' }}
              />
              <button
                onClick={() => setActiveDetailItem(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${activeDetailItem.price}
                  </span>
                  {activeDetailItem.isNegotiable && (
                    <span className="badge badge-indigo">Price Negotiable</span>
                  )}
                </div>
                <span className="badge badge-neutral">{activeDetailItem.condition}</span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeDetailItem.title}</h2>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {activeDetailItem.description}
              </p>

              {/* Pickup location & safety note */}
              <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                  <MapPin size={15} color="var(--primary)" />
                  <span>Pickup Location: {activeDetailItem.pickupLocation}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={14} color="var(--success)" />
                  <span>Inspect before exchanging payment in safe campus common areas.</span>
                </div>
              </div>

              {/* Seller details */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={activeDetailItem.sellerAvatar} alt={activeDetailItem.sellerName} style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{activeDetailItem.sellerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Student at {activeDetailItem.sellerCollege} • ⭐ {activeDetailItem.sellerRating} Rating
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Link Copied', 'Product link copied to clipboard.', 'success');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setActiveDetailItem(null)}>
                Close
              </button>
              {activeDetailItem.sellerId !== currentUser.id && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsInquiryModalOpen(true)}
                >
                  <Send size={14} /> Send Buyer Inquiry
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Inquiry Modal */}
      {isInquiryModalOpen && activeDetailItem && (
        <div className="modal-overlay" onClick={() => setIsInquiryModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Contact Seller</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeDetailItem.title} (${activeDetailItem.price})
                </div>
              </div>
              <button onClick={() => setIsInquiryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendInquirySubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Message to Seller *</label>
                  <textarea
                    required
                    className="textarea-field"
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Optional Counter Offer ($)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder={`Original listed price is $${activeDetailItem.price}`}
                    value={inquiryOfferPrice}
                    onChange={(e) => setInquiryOfferPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsInquiryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>List an Item on Campus Marketplace</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateListingSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Item Title *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Introduction to Algorithms (CLRS 4th Edition)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="select-field"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Condition *</label>
                    <select
                      className="select-field"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value as any)}
                    >
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Price ($ USD) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="input-field"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Campus Pickup Location *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g. Library Lobby, Hostel 3"
                      value={newPickupLocation}
                      onChange={(e) => setNewPickupLocation(e.target.value)}
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newIsNegotiable}
                    onChange={(e) => setNewIsNegotiable(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>Open to reasonable price negotiation (OBO)</span>
                </label>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    required
                    className="textarea-field"
                    rows={3}
                    placeholder="Condition details, included accessories, usage history..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Item Photo URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalItemId}
        title="Delete Listing?"
        message="Are you sure you want to remove this item from the campus marketplace?"
        confirmLabel="Delete Item"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalItemId(null)}
      />
    </div>
  );
};
