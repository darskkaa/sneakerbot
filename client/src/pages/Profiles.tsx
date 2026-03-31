import { useState } from 'react';
import { Plus, Pencil, Trash2, CreditCard, MapPin, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProfileForm from '../components/profiles/ProfileForm';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/common/EmptyState';
import { Skeleton } from '../components/ui/skeleton';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

const ProfileSkeleton = () => (
  <div className="card p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="w-7 h-7 rounded" />
        <Skeleton className="w-7 h-7 rounded" />
      </div>
    </div>
    <div className="rounded-md bg-secondary/50 p-3 space-y-1.5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-3 w-36" />
    </div>
    <div className="rounded-md bg-secondary/50 p-3 space-y-1.5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-3 w-36 font-mono" />
    </div>
  </div>
);

export default function Profiles() {
  const { profiles, loading, deleteProfile } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEdit = (profile: any) => { setEditingProfile(profile); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingProfile(null); };

  const doDelete = async () => {
    if (!deleteId) return;
    await deleteProfile(deleteId).catch(console.error);
    setDeleteId(null);
  };

  const maskCard = (n: string) => n ? `•••• •••• •••• ${n.slice(-4)}` : '—';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Profiles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Shipping and payment profiles</p>
        </div>
        <button onClick={() => { setEditingProfile(null); setIsFormOpen(true); }} className="btn-primary text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Profile
        </button>
      </div>

      {loading.profiles ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <ProfileSkeleton key={i} />)}
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState
          title="No profiles yet"
          description="Create a profile with your shipping and payment information."
          actionText="Create Profile"
          onAction={() => { setEditingProfile(null); setIsFormOpen(true); }}
          icon={IdentificationIcon}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="card p-4 space-y-3 hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{profile.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(profile)} className="btn-icon text-muted-foreground hover:text-foreground" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(profile.id)} className="btn-icon text-muted-foreground hover:text-destructive" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-md bg-secondary/50 p-3 space-y-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Shipping</span>
                </div>
                <p className="text-xs text-foreground font-medium">{profile.shippingInfo.firstName} {profile.shippingInfo.lastName}</p>
                <p className="text-xs text-muted-foreground">{profile.shippingInfo.email}</p>
                <p className="text-xs text-muted-foreground">
                  {profile.shippingInfo.address1}{profile.shippingInfo.address2 && `, ${profile.shippingInfo.address2}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile.shippingInfo.city}, {profile.shippingInfo.state} {profile.shippingInfo.zipCode}
                </p>
              </div>

              <div className="rounded-md bg-secondary/50 p-3 space-y-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Payment</span>
                </div>
                <p className="text-xs text-foreground font-medium">{profile.billingInfo.cardholderName}</p>
                <p className="text-xs font-mono text-muted-foreground">{maskCard(profile.billingInfo.cardNumber)}</p>
                <p className="text-xs text-muted-foreground">Exp {profile.billingInfo.expiryMonth}/{profile.billingInfo.expiryYear}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && <ProfileForm isOpen={isFormOpen} onClose={closeForm} profile={editingProfile} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Profile"
        description="This profile and all its data will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={doDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
