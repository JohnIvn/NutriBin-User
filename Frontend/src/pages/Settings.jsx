import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { accountSettingsSchema } from "@/schema/userAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import {
  User,
  Lock,
  AlertTriangle,
  Camera,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Mail,
  Shield,
  Check,
  X,
  Loader2,
  Upload,
  Trash2,
} from "lucide-react";

// Constants
const PHONE_VERIFICATION_REGEX = /^[0-9]{6}$/;
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 20,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const PHONE_CHECK_DEBOUNCE = 600;

export default function Settings() {
  // Form state
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedProfile, setSavedProfile] = useState(null);

  // User context
  const { user, logout, refreshUser } = useUser();
  const navigate = useNavigate();
  const defaultPosition = [14.5995, 120.9842];

  // Password reset state
  const [resetOpen, setResetOpen] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [emailShown, setEmailShown] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [codeFormatValid, setCodeFormatValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account closure state
  const [closingAccount, setClosingAccount] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  // MFA state
  const [mfaType, setMfaType] = useState("N/A");
  const [mfaLoading, setMfaLoading] = useState(false);

  // Photo upload state
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(undefined);
  const avatarInputRef = useRef(null);

  // Phone verification state
  const [originalNumber, setOriginalNumber] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [phoneCode, setPhoneCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneAvailable, setPhoneAvailable] = useState(true);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Form setup
  const form = useForm({
    resolver: zodResolver(accountSettingsSchema),
    mode: "onChange",
    defaultValues: {
      firstname: "",
      lastname: "",
      address: "",
      number: "",
    },
  });

  const {
    formState: { isValid },
  } = form;

  // Utility: Get user initials
  const getInitials = useCallback((first, last) => {
    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
  }, []);

  // Utility: Validate password requirements
  const validatePassword = useCallback(
    (password) => {
      return {
        minLength:
          password &&
          password.length >= PASSWORD_REQUIREMENTS.minLength &&
          password.length <= PASSWORD_REQUIREMENTS.maxLength,
        hasUppercase: password && /[A-Z]/.test(password),
        hasLowercase: password && /[a-z]/.test(password),
        hasNumber: password && /\d/.test(password),
        hasSpecial: password && /[^A-Za-z0-9]/.test(password),
        match: password && confirmPassword && password === confirmPassword,
      };
    },
    [confirmPassword],
  );

  const passwordChecks = validatePassword(newPassword);
  const allPasswordRequirementsMet =
    Object.values(passwordChecks).every(Boolean);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    const userId = user?.customer_id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await Requests({
        url: `/settings/${userId}`,
        method: "GET",
      });

      if (response.data.ok) {
        const userData = response.data.user;

        const profileValues = {
          firstname: userData.first_name || "",
          lastname: userData.last_name || "",
          address: userData.address || "",
          number: userData.contact_number || "",
        };

        setSavedProfile(profileValues);
        setOriginalNumber(profileValues.number);
        form.reset(profileValues);

        setCurrentAvatar(
          userData.avatar ||
            userData.profile_photo ||
            userData.profile_image ||
            userData.photo ||
            undefined,
        );
        setEmailShown(userData?.email || "");
      }
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.customer_id, form]);

  // Fetch MFA settings
  const fetchMFASettings = useCallback(async () => {
    const userId = user?.customer_id;
    if (!userId) return;

    try {
      const response = await Requests({
        url: `/authentication/${userId}/mfa`,
        method: "GET",
      });

      if (response.data.ok) {
        setMfaType(response.data.mfaType || "N/A");
      }
    } catch (error) {
      console.error("Failed to load MFA settings", error);
    }
  }, [user?.customer_id]);

  // Handle MFA change
  const handleMFAChange = async (newMfaType) => {
    const userId = user?.customer_id;
    if (!userId) return;

    try {
      setMfaLoading(true);
      const response = await Requests({
        url: `/authentication/${userId}/mfa`,
        method: "PATCH",
        data: { mfaType: newMfaType },
      });

      if (response.data.ok) {
        setMfaType(newMfaType);
        const mfaLabel =
          newMfaType === "N/A"
            ? "Disabled"
            : newMfaType === "email"
              ? "Email"
              : "SMS";
        toast.success(`MFA set to ${mfaLabel}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update MFA settings",
      );
      console.error(error);
    } finally {
      setMfaLoading(false);
    }
  };

  // Handle profile submission
  const handleSubmission = async () => {
    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    // Check if phone needs verification
    if (!phoneVerified && pendingPhone !== originalNumber) {
      toast.error("Please verify your new phone number before saving");
      return;
    }

    try {
      setSaveLoading(true);
      const values = form.getValues();

      const response = await Requests({
        url: `/settings/${userId}`,
        method: "PATCH",
        data: {
          firstname: values.firstname,
          lastname: values.lastname,
          address: values.address,
          contact: values.number,
        },
      });

      if (response.data.ok) {
        toast.success("Profile updated successfully");
        setEditMode(false);
        await fetchProfile();
        await refreshUser?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle profile cancel
  const handleCancel = useCallback(() => {
    if (savedProfile) {
      form.reset(savedProfile);
      setOriginalNumber(savedProfile.number);
    }
    setPendingPhone("");
    setPhoneVerified(true);
    setPhoneCode("");
    setPhoneError("");
    setEditMode(false);
  }, [savedProfile, form]);

  // Send phone verification code
  const sendPhoneCode = async () => {
    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    if (!pendingPhone) {
      toast.error("Enter a phone number to verify");
      return;
    }

    if (!phoneAvailable) {
      toast.error("That phone number is already in use");
      return;
    }

    try {
      setSendingCode(true);
      const res = await Requests({
        url: `/settings/${userId}/phone/verify/request`,
        method: "POST",
        data: { newPhone: pendingPhone },
      });

      if (res.data?.ok) {
        toast.success("Verification code sent");
      } else {
        toast.error(res.data?.message || "Failed to send verification code");
      }
    } catch (err) {
      toast.error("Failed to send verification code");
      console.error(err);
    } finally {
      setSendingCode(false);
    }
  };

  // Verify phone number
  const verifyPhone = async () => {
    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    if (!phoneCode || !PHONE_VERIFICATION_REGEX.test(phoneCode.trim())) {
      setPhoneError("Enter a 6-digit code");
      return;
    }

    try {
      setVerifyingPhone(true);
      const res = await Requests({
        url: `/settings/${userId}/phone/verify`,
        method: "POST",
        data: { code: phoneCode, newPhone: pendingPhone },
      });

      if (res.data?.ok) {
        toast.success("Phone verified");
        setPhoneVerified(true);
        setOriginalNumber(pendingPhone);
        form.setValue("number", pendingPhone);
        setPhoneCode("");
        setPhoneError("");
      } else {
        toast.error(res.data?.message || "Verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify phone");
      console.error(err);
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    if (selectedPhoto.size > MAX_PHOTO_SIZE) {
      toast.error("Photo must be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append("photo", selectedPhoto);

      const res = await Requests({
        url: `/settings/${userId}/photo`,
        method: "POST",
        data: fd,
      });

      if (res.data?.ok) {
        toast.success("Photo uploaded");
        await fetchProfile();
        await refreshUser?.();
        setSelectedPhoto(null);
        setPreviewUrl("");
      } else {
        toast.error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Failed to upload photo");
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle photo removal
  const handlePhotoRemove = async () => {
    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      const res = await Requests({
        url: `/settings/${userId}/photo`,
        method: "DELETE",
      });

      if (res.data?.ok) {
        setCurrentAvatar("");
        setSelectedPhoto(null);
        setPreviewUrl("");
        await fetchProfile();
        await refreshUser?.();
        toast.success("Photo removed");
      } else {
        toast.error(res.data?.message || "Failed to remove photo");
      }
    } catch (err) {
      toast.error("Failed to remove photo");
      console.error(err);
    }
  };

  // Handle password reset request
  const handlePasswordResetRequest = async () => {
    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      setSendingReset(true);
      const res = await Requests({
        url: `/settings/${userId}/password-reset`,
        method: "POST",
      });

      if (res.data?.ok) {
        setResetSent(true);
        toast.success("Code sent!");
      } else {
        toast.error(res.data?.message || "Failed to send code");
      }
    } catch (err) {
      toast.error("Error sending code");
      console.error(err);
    } finally {
      setSendingReset(false);
    }
  };

  // Handle password reset submission
  const handlePasswordResetSubmit = async () => {
    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    if (!allPasswordRequirementsMet) {
      toast.error("Please meet all password requirements");
      return;
    }

    if (!codeFormatValid) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setResetSubmitting(true);
      const res = await Requests({
        url: `/settings/${userId}/password-reset/verify`,
        method: "POST",
        data: { code: resetCode, newPassword },
      });

      if (res.data?.ok) {
        toast.success("Password changed successfully!");
        handleResetDialogClose();
      } else {
        toast.error(res.data?.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
      console.error(error);
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handle reset dialog close
  const handleResetDialogClose = () => {
    setResetOpen(false);
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetSent(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleDragEnd = async (e) => {
    const { lat, lng } = e.target.getLatLng();

    // Nominatim / other reverse geocoding
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    );
    const data = await res.json();

    const addressString = data.display_name || `${lat}, ${lng}`;
    form.setValue("address", addressString);
  };

  // Handle account closure
  const handleCloseAccount = async () => {
    const userId = user?.customer_id;
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      setClosingAccount(true);
      const response = await Requests({
        url: `/settings/${userId}/close`,
        method: "PATCH",
      });

      if (response.data?.ok) {
        toast.success("Account deactivated. You have been logged out.");
        logout();
        navigate("/login");
      } else {
        toast.error(response.data?.message || "Failed to close account");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close account");
      console.error(error);
    } finally {
      setClosingAccount(false);
      setCloseConfirmOpen(false);
    }
  };

  // Effect: Load profile and MFA on mount
  useEffect(() => {
    const userId = user?.customer_id;
    if (userId) {
      fetchProfile();
      fetchMFASettings();
    } else {
      setLoading(false);
    }
  }, [user?.customer_id, fetchProfile, fetchMFASettings]);

  // Effect: Validate reset code format
  useEffect(() => {
    if (!resetCode) {
      setCodeFormatValid(false);
      return;
    }
    setCodeFormatValid(/^\d{6}$/.test(resetCode.trim()));
  }, [resetCode]);

  // Effect: Watch for phone number changes
  const watchedNumber = form.watch("number");
  useEffect(() => {
    if (loading) return;

    if ((watchedNumber || "") !== (originalNumber || "")) {
      setPendingPhone(watchedNumber || "");
      setPhoneVerified(false);
    } else {
      setPendingPhone("");
      setPhoneVerified(true);
    }
  }, [watchedNumber, originalNumber, loading]);

  // Effect: Check phone availability (debounced)
  useEffect(() => {
    if (!pendingPhone) {
      setPhoneAvailable(true);
      setCheckingPhone(false);
      return;
    }

    let cancelled = false;
    setCheckingPhone(true);

    const timer = setTimeout(async () => {
      try {
        const res = await Requests({
          url: `/settings/check-phone/${encodeURIComponent(pendingPhone)}`,
          method: "GET",
        });

        if (!cancelled) {
          setPhoneAvailable(res.data?.available === true);
        }
      } catch (err) {
        console.error("Phone availability check failed", err);
        if (!cancelled) {
          setPhoneAvailable(true);
        }
      } finally {
        if (!cancelled) {
          setCheckingPhone(false);
        }
      }
    }, PHONE_CHECK_DEBOUNCE);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pendingPhone]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function MapClickHandler({ form }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        form.setValue("address", `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      },
    });
    return null;
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#4F6F52]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#4F6F52] to-[#3A523D] bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your personal information and security preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[#4F6F52] to-[#3A523D] px-6 py-8">
                  <div className="flex items-center gap-6">
                    {/* Avatar Section */}
                    <div className="relative group">
                      <label
                        htmlFor="avatar-input"
                        className="block w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-transform hover:scale-105"
                        aria-label="Upload profile photo"
                      >
                        <Avatar className="w-full h-full">
                          <AvatarImage
                            src={previewUrl || currentAvatar || undefined}
                            className="w-full h-full object-cover"
                            alt="Profile avatar"
                          />
                          <AvatarFallback className="bg-white/20 text-white font-bold text-3xl backdrop-blur-sm">
                            {getInitials(
                              form.getValues().firstname ||
                                user?.first_name ||
                                user?.email?.[0],
                              form.getValues().lastname ||
                                user?.last_name ||
                                "",
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </label>
                      <input
                        id="avatar-input"
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > MAX_PHOTO_SIZE) {
                              toast.error("Photo must be less than 5MB");
                              return;
                            }
                            setSelectedPhoto(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                        aria-label="Select profile photo file"
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-white">
                      <h2 className="text-2xl font-bold">
                        {form.getValues().firstname ||
                          user?.first_name ||
                          "User"}{" "}
                        {form.getValues().lastname || user?.last_name || ""}
                      </h2>
                      <p className="text-white/80 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {emailShown || user?.email}
                      </p>

                      {/* Photo Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        {selectedPhoto && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={uploadingPhoto}
                            className="h-8 px-3 bg-white text-[#4F6F52] hover:bg-white/90"
                            onClick={handlePhotoUpload}
                          >
                            {uploadingPhoto ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 mr-1.5" />
                                Upload
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          className="h-8 px-3 bg-white/20 text-white hover:bg-white/30 border border-white/30"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <Camera className="w-3 h-3 mr-1.5" />
                          Change Photo
                        </Button>

                        {(selectedPhoto || currentAvatar) && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3 text-white/90 hover:bg-white/20"
                            onClick={handlePhotoRemove}
                          >
                            <Trash2 className="w-3 h-3 mr-1.5" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {selectedPhoto && (
                        <div className="mt-2 text-xs text-white/70">
                          {selectedPhoto.name} (
                          {Math.round(selectedPhoto.size / 1024)} KB)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center gap-4 py-16">
                      <Loader2 className="w-10 h-10 text-[#4F6F52] animate-spin" />
                      <p className="text-gray-500 font-medium">
                        Loading your profile...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <User className="w-4 h-4 text-[#4F6F52]" />
                          <h3 className="font-semibold text-gray-900">
                            Personal Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  First Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!editMode}
                                    className="h-11 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 focus-visible:border-[#4F6F52] disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                    placeholder="Enter your first name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="lastname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Last Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!editMode}
                                    className="h-11 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 focus-visible:border-[#4F6F52] disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                    placeholder="Enter your last name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <Phone className="w-4 h-4 text-[#4F6F52]" />
                          <h3 className="font-semibold text-gray-900">
                            Contact Information
                          </h3>
                        </div>

                        <FormField
                          control={form.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!editMode}
                                  className="h-11 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 focus-visible:border-[#4F6F52] disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                  placeholder="+63 XXX XXX XXXX"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Phone Verification UI */}
                        {editMode &&
                          pendingPhone &&
                          pendingPhone !== originalNumber && (
                            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-3 animate-in slide-in-from-top-2">
                              <div className="flex items-start gap-2">
                                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-900">
                                    Phone Verification Required
                                  </p>
                                  <p className="text-xs text-blue-700 mt-1">
                                    Verify your new number to save changes
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                                  disabled={
                                    sendingCode ||
                                    checkingPhone ||
                                    !phoneAvailable
                                  }
                                  onClick={sendPhoneCode}
                                  type="button"
                                >
                                  {sendingCode ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    "Send Code"
                                  )}
                                </Button>

                                {checkingPhone && (
                                  <span className="text-sm text-gray-600 flex items-center gap-1.5">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Checking...
                                  </span>
                                )}
                                {!checkingPhone && !phoneAvailable && (
                                  <span className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                                    <X className="w-4 h-4" />
                                    Number in use
                                  </span>
                                )}
                                {phoneVerified && (
                                  <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                                    <Check className="w-4 h-4" />
                                    Verified
                                  </span>
                                )}
                              </div>

                              {!phoneVerified && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Input
                                    placeholder="6-digit code"
                                    value={phoneCode}
                                    onChange={(e) => {
                                      setPhoneCode(
                                        e.target.value.replace(/\D/g, ""),
                                      );
                                      setPhoneError("");
                                    }}
                                    maxLength={6}
                                    className="h-9 w-32 text-center tracking-widest font-mono"
                                  />
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                                    onClick={verifyPhone}
                                    disabled={verifyingPhone}
                                    type="button"
                                  >
                                    {verifyingPhone ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                        Verifying...
                                      </>
                                    ) : (
                                      "Verify"
                                    )}
                                  </Button>
                                </div>
                              )}

                              {phoneError && (
                                <p className="text-xs text-red-600 font-medium">
                                  {phoneError}
                                </p>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Address Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <MapPin className="w-4 h-4 text-[#4F6F52]" />
                          <h3 className="font-semibold text-gray-900">
                            Address
                          </h3>
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Street Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!editMode}
                                  className="h-11 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20 focus-visible:border-[#4F6F52] disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                                  placeholder="Enter your address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {editMode && (
                          <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                            <MapContainer
                              center={defaultPosition}
                              zoom={13}
                              scrollWheelZoom={true}
                              style={{ height: "280px", width: "100%" }}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker
                                position={defaultPosition}
                                draggable={editMode}
                                eventHandlers={{ dragend: handleDragEnd }}
                              >
                                <Popup>Drag me to update your location</Popup>
                              </Marker>
                              <MapClickHandler form={form} />
                            </MapContainer>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                        {!editMode ? (
                          <Button
                            type="button"
                            className="h-11 px-8 bg-gradient-to-r from-[#4F6F52] to-[#3A523D] hover:from-[#3A523D] hover:to-[#2A3D29] text-white font-semibold shadow-md hover:shadow-lg transition-all"
                            onClick={() => setEditMode(true)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="button"
                              disabled={
                                saveLoading ||
                                !isValid ||
                                (!phoneVerified &&
                                  pendingPhone !== originalNumber)
                              }
                              className="h-11 px-8 bg-gradient-to-r from-[#4F6F52] to-[#3A523D] hover:from-[#3A523D] hover:to-[#2A3D29] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={handleSubmission}
                            >
                              {saveLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Save Changes
                                </>
                              )}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              disabled={saveLoading}
                              className="h-11 px-8 border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all"
                              onClick={handleCancel}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Security Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#4F6F52] to-[#3A523D] px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Lock className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Security</h3>
                </div>
              </div>

              <div className="p-5 space-y-6">
                {/* Password Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4F6F52]" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Password
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Keep your account secure with a strong password
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-10 bg-gradient-to-r from-[#4F6F52] to-[#3A523D] text-white hover:from-[#3A523D] hover:to-[#2A3D29] border-none shadow-sm hover:shadow-md transition-all"
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setResetOpen(true);
                    }}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="border-t border-gray-100" />

                {/* MFA Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#4F6F52]" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Two-Factor Authentication
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {[
                      { value: "N/A", label: "Disabled", icon: X },
                      { value: "email", label: "Email", icon: Mail },
                      { value: "sms", label: "SMS", icon: Phone },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            mfaType === option.value
                              ? "border-[#4F6F52] bg-[#4F6F52]/5"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="mfa"
                            value={option.value}
                            checked={mfaType === option.value}
                            onChange={() => handleMFAChange(option.value)}
                            disabled={mfaLoading}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              mfaType === option.value
                                ? "border-[#4F6F52] bg-[#4F6F52]"
                                : "border-gray-300"
                            }`}
                          >
                            {mfaType === option.value && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900 flex-1">
                            {option.label}
                          </span>
                          {mfaType === option.value && (
                            <Check className="w-4 h-4 text-[#4F6F52]" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Danger Zone */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Danger Zone
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full h-10 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all"
                    disabled={closingAccount}
                    onClick={() => setCloseConfirmOpen(true)}
                    type="button"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#4F6F52] flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              We'll send a verification code to your email address
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Email Display */}
            <div className="p-4 bg-gradient-to-r from-[#4F6F52]/10 to-[#3A523D]/10 rounded-xl border border-[#4F6F52]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#4F6F52]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Send code to
                    </p>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {emailShown || user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#4F6F52] hover:bg-[#3A523D] text-white h-9 px-4"
                  disabled={sendingReset}
                  onClick={handlePasswordResetRequest}
                  type="button"
                >
                  {sendingReset ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : resetSent ? (
                    "Resend"
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </div>
            </div>

            {/* Verification Code */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Verification Code
              </label>
              <Input
                placeholder="000000"
                maxLength={6}
                className="text-center tracking-[0.5em] font-mono text-xl h-14 border-2 border-gray-200 focus-visible:border-[#4F6F52] focus-visible:ring-2 focus-visible:ring-[#4F6F52]/20"
                value={resetCode}
                onChange={(e) =>
                  setResetCode(e.target.value.replace(/[^0-9]/g, ""))
                }
              />
            </div>

            {/* Password Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    className="h-11 pr-10 border-2 border-gray-200 focus-visible:border-[#4F6F52]"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#4F6F52] transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Confirm
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    className="h-11 pr-10 border-2 border-gray-200 focus-visible:border-[#4F6F52]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#4F6F52] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "minLength", label: "8-20 characters" },
                    { key: "hasUppercase", label: "Uppercase" },
                    { key: "hasLowercase", label: "Lowercase" },
                    { key: "hasNumber", label: "Number" },
                    { key: "hasSpecial", label: "Special char" },
                    { key: "match", label: "Match" },
                  ].map((req) => (
                    <div
                      key={req.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          passwordChecks[req.key]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {passwordChecks[req.key] && (
                          <Check className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks[req.key]
                            ? "text-green-700 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="w-full h-12 bg-gradient-to-r from-[#4F6F52] to-[#3A523D] hover:from-[#3A523D] hover:to-[#2A3D29] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              disabled={
                resetSubmitting ||
                !codeFormatValid ||
                !allPasswordRequirementsMet
              }
              onClick={handlePasswordResetSubmit}
            >
              {resetSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Closure Dialog */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Deactivate Account
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              This action will deactivate your account and log you out
              immediately. Your data will be retained but your account will be
              marked as inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCloseConfirmOpen(false)}
              disabled={closingAccount}
              type="button"
              className="flex-1 h-11 border-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
              onClick={handleCloseAccount}
              disabled={closingAccount}
              type="button"
            >
              {closingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
