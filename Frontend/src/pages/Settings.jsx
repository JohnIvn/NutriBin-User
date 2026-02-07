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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { User, Lock, AlertTriangle, Camera, Eye, EyeOff } from "lucide-react";

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
    formState: { isValid, isDirty },
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

  return (
    <section className="flex bg-[#ECE3CE]/10 flex-col min-h-screen w-full justify-start items-center p-4 sm:p-8 gap-8">
      {/* Header */}
      <div className="w-full max-w-7xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account details and preferences.
        </p>
      </div>

      <section className="flex flex-col lg:flex-row w-full max-w-7xl gap-8 items-start">
        {/* Left Column: Profile Form */}
        <Form {...form}>
          <form className="w-full lg:flex-1 space-y-8 bg-white border border-gray-100 shadow-sm rounded-xl p-6 sm:p-8">
            {/* Section Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="bg-[#4F6F52]/10 p-2 rounded-lg">
                <User className="w-5 h-5 text-[#4F6F52]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Personal Information
                </h2>
                <p className="text-xs text-gray-500">
                  Update your personal details here.
                </p>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="py-6 border-b border-gray-100">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <label
                    htmlFor="avatar-input"
                    className="block w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                    aria-label="Upload profile photo"
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={previewUrl || currentAvatar || undefined}
                        className="w-full h-full object-cover"
                        alt="Profile avatar"
                      />
                      <AvatarFallback className="bg-[#4F6F52]/10 text-[#4F6F52] font-bold text-xl">
                        {getInitials(
                          form.getValues().firstname ||
                            user?.first_name ||
                            user?.email?.[0],
                          form.getValues().lastname || user?.last_name || "",
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute right-0 bottom-0 -mb-1 -mr-1 bg-white rounded-full p-1 shadow">
                      <Camera className="w-4 h-4 text-gray-600" />
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

                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">
                    Profile Photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a square image for best results. JPG, PNG up to 5MB.
                  </p>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <Button
                      type="button"
                      disabled={!selectedPhoto || uploadingPhoto}
                      className="h-9 px-3 bg-[#4F6F52] text-white hover:bg-[#3A523D] disabled:opacity-50"
                      onClick={handlePhotoUpload}
                    >
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </Button>

                    <Button
                      type="button"
                      className="h-9 px-3 bg-[#4F6F52] hover:bg-[#3A523D] text-white"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      Choose
                    </Button>

                    {(selectedPhoto || currentAvatar) && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handlePhotoRemove}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {selectedPhoto && (
                    <div className="mt-2 text-xs text-gray-600">
                      Selected: {selectedPhoto.name} (
                      {Math.round(selectedPhoto.size / 1024)} KB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-4 border-[#4F6F52] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#4F6F52] text-sm font-medium">
                  Loading profile...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52] disabled:opacity-60"
                            aria-label="First name"
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
                        <FormLabel className="text-gray-600">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52] disabled:opacity-60"
                            aria-label="Last name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Field */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!editMode}
                          className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52] disabled:opacity-60"
                          aria-label="Address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Number Field */}
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600">
                          Contact Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!editMode}
                            className="h-11 border-gray-200 focus-visible:ring-[#4F6F52] focus-visible:border-[#4F6F52] text-[#4F6F52] disabled:opacity-60"
                            aria-label="Contact number"
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
                      <div className="mt-2 space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700 font-medium">
                          You changed your phone number. Please verify it to
                          save changes.
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="bg-[#4F6F52] hover:bg-[#3A523D] text-white h-9"
                            disabled={
                              sendingCode || checkingPhone || !phoneAvailable
                            }
                            onClick={sendPhoneCode}
                            type="button"
                          >
                            {sendingCode
                              ? "Sending..."
                              : checkingPhone
                                ? "Checking..."
                                : "Send verification code"}
                          </Button>

                          {checkingPhone && (
                            <span className="text-sm text-gray-500">
                              Checking availability...
                            </span>
                          )}
                          {!checkingPhone && !phoneAvailable && (
                            <span className="text-sm text-red-600 font-medium">
                              Number already in use
                            </span>
                          )}
                          {phoneVerified && (
                            <span className="text-sm text-green-600 font-medium">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        {!phoneVerified && (
                          <div className="flex items-start gap-2 mt-2 flex-wrap">
                            <Input
                              placeholder="Enter 6-digit code"
                              value={phoneCode}
                              onChange={(e) => {
                                setPhoneCode(e.target.value.replace(/\D/g, ""));
                                setPhoneError("");
                              }}
                              maxLength={6}
                              className="h-9 w-44"
                              aria-label="Phone verification code"
                            />
                            <Button
                              size="sm"
                              className="bg-[#4F6F52] hover:bg-[#3A523D] text-white h-9"
                              onClick={verifyPhone}
                              disabled={verifyingPhone}
                              type="button"
                            >
                              {verifyingPhone ? "Verifying..." : "Verify"}
                            </Button>
                          </div>
                        )}

                        {phoneError && (
                          <div className="text-xs text-red-600 font-medium">
                            {phoneError}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                  {!editMode ? (
                    <Button
                      type="button"
                      className="h-11 px-8 bg-[#4F6F52] hover:bg-[#3A523D] text-white font-semibold transition-all"
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        disabled={
                          saveLoading ||
                          !isValid ||
                          (!phoneVerified && pendingPhone !== originalNumber)
                        }
                        className="h-11 px-8 bg-[#4F6F52] hover:bg-[#3A523D] text-white font-semibold transition-all disabled:opacity-50"
                        onClick={handleSubmission}
                      >
                        {saveLoading ? "Saving..." : "Save Changes"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={saveLoading}
                        className="h-11 px-8 bg-red-600 text-white border-red-600 font-semibold hover:bg-red-700 hover:border-red-700"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </form>
        </Form>

        {/* Right Column: Security & Actions */}
        <div className="flex flex-col w-full lg:w-96 gap-6">
          {/* Security Card */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#4F6F52]" />
              <h3 className="font-bold text-gray-800 text-sm">
                Security & Privacy
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Password Reset */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Password
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Secure your account by updating your password regularly.
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 bg-[#3A4D39] text-white hover:bg-[#2A3D29] border-[#3A4D39]"
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setResetOpen(true);
                  }}
                >
                  Change Password
                </Button>
              </div>

              <hr className="border-gray-100" />

              {/* MFA Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#4F6F52]" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    Multi-Factor Authentication
                  </h4>
                </div>

                <div
                  className="space-y-2"
                  role="radiogroup"
                  aria-label="Multi-factor authentication options"
                >
                  {[
                    { value: "N/A", label: "Disabled", desc: null },
                    {
                      value: "email",
                      label: "Email Verification",
                      desc: "Code sent to email on login",
                    },
                    {
                      value: "sms",
                      label: "SMS Verification",
                      desc: "Code sent to your phone on login",
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-[#ECE3CE]/20 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="mfa"
                        value={option.value}
                        checked={mfaType === option.value}
                        onChange={() => handleMFAChange(option.value)}
                        disabled={mfaLoading}
                        className="accent-[#4F6F52] w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {option.label}
                        </div>
                        {option.desc && (
                          <div className="text-[10px] text-gray-500">
                            {option.desc}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Close Account */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full h-10 text-red-600 hover:text-red-700 hover:bg-red-50 justify-start px-2"
                  disabled={closingAccount}
                  onClick={() => setCloseConfirmOpen(true)}
                  type="button"
                >
                  Deactivate Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Password Reset Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#4F6F52]">
              Change Password
            </DialogTitle>
            <DialogDescription>
              We'll send a code to your email to verify it's you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Email Display & Send Code */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm">
                <p className="text-gray-500 text-xs uppercase font-bold">
                  Send code to:
                </p>
                <p className="font-medium text-gray-900">
                  {emailShown || user?.email}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#4F6F52] hover:bg-[#3A523D] text-white text-xs h-8"
                disabled={sendingReset}
                onClick={handlePasswordResetRequest}
                type="button"
              >
                {sendingReset
                  ? "Sending..."
                  : resetSent
                    ? "Resend"
                    : "Send Code"}
              </Button>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-1">
              <label
                htmlFor="reset-code-input"
                className="text-xs font-semibold text-gray-600"
              >
                Verification Code
              </label>
              <Input
                id="reset-code-input"
                placeholder="000000"
                maxLength={6}
                className="text-center tracking-[0.5em] font-mono text-lg border-gray-200 focus-visible:border-[#4F6F52] text-[#4F6F52]"
                value={resetCode}
                onChange={(e) =>
                  setResetCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                aria-label="6-digit verification code"
              />
            </div>

            {/* Password Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="new-password-input"
                  className="text-xs font-semibold text-gray-600"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password-input"
                    type={showNewPassword ? "text" : "password"}
                    className="border-gray-200 focus-visible:border-[#4F6F52] pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-label="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#4F6F52]"
                    tabIndex={-1}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirm-password-input"
                  className="text-xs font-semibold text-gray-600"
                >
                  Confirm
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password-input"
                    type={showConfirmPassword ? "text" : "password"}
                    className="border-gray-200 focus-visible:border-[#4F6F52] pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-label="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#4F6F52]"
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
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

            {/* Password Requirements Checklist */}
            {newPassword && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Password must contain:
                </p>
                <div className="space-y-1">
                  {[
                    { key: "minLength", label: "8-20 characters" },
                    { key: "hasUppercase", label: "One uppercase letter" },
                    { key: "hasLowercase", label: "One lowercase letter" },
                    { key: "hasNumber", label: "One number" },
                    { key: "hasSpecial", label: "One special character" },
                    { key: "match", label: "Passwords match" },
                  ].map((req) => (
                    <div
                      key={req.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          passwordChecks[req.key]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                        aria-label={
                          passwordChecks[req.key]
                            ? "Requirement met"
                            : "Requirement not met"
                        }
                      >
                        {passwordChecks[req.key] && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          passwordChecks[req.key]
                            ? "text-green-700"
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
              className="w-full bg-[#4F6F52] hover:bg-[#3A523D] disabled:opacity-50"
              disabled={
                resetSubmitting ||
                !codeFormatValid ||
                !allPasswordRequirementsMet
              }
              onClick={handlePasswordResetSubmit}
            >
              {resetSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Closure Confirmation Dialog */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Deactivate Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate your account? You will be
              logged out immediately and your account will be marked as
              inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setCloseConfirmOpen(false)}
              disabled={closingAccount}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCloseAccount}
              disabled={closingAccount}
              type="button"
            >
              {closingAccount ? "Deactivating..." : "Yes, Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
