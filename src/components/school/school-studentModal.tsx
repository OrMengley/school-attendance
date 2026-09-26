import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useUser } from "../../context/UserContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select";
import API from "../../lib/axios";
import { toast } from "sonner";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { StudentType } from "../../types/Student";
import type { TermType } from "../../types/Term";
import type { ClassroomType } from "../../types/Classroom";

interface CreateStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: StudentType | null;
    onSuccess?: () => void;
}

export default function CreateStudentModal({ isOpen, onClose, initialData, onSuccess }: CreateStudentModalProps) {

    const { user } = useUser();
    // variables for upload image
    const [url, setUrl] = useState<string>("");
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // Handle image pick and auto-upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setError("");
            setUploading(true);
            setUploadProgress(0);
            try {
                const downloadURL = await uploadToCloudinary(file, {
                    folder: "students/profile",
                    onProgress: (percent) => {
                        setUploadProgress(percent);
                    },
                });
                setUrl(downloadURL);
                setProfileUrl(downloadURL);
                setUploading(false);
                setUploadProgress(100);
            } catch (err: any) {
                const msg = err?.response?.data?.error?.message || err?.message || "Failed to upload image";
                setError("Failed to upload image: " + msg);
                toast.error("Failed to upload image: " + msg);
                setUploading(false);
            }
        }
    };


    const [firstName, setFirstName] = useState(initialData?.firstName || "");
    const [lastName, setLastName] = useState(initialData?.lastName || "");
    const [fullName, setFullName] = useState(initialData?.name || "");

    const [openCalenda, setOpenCalenda] = React.useState(false)
    const [dob, setDob] = useState<Date | undefined>(initialData?.dob ? new Date(initialData.dob) : undefined);
    const [address, setAddress] = useState(initialData?.address || "");
    const [parentPhone, setParentPhone] = useState(initialData?.parentPhone || "");
    const [profileUrl, setProfileUrl] = useState(initialData?.profileUrl || "");
    const [sex, setSex] = useState<"male" | "female">(initialData?.sex || "male");
    const [classroom_id, setClassroom_id] = useState(initialData?.classroom_id || "");
    const [term_id, setTerm_id] = useState(initialData?.term_id || "");
    const [status, setStatus] = useState<"active" | "inactive">(initialData?.status || "active");

    const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
    const [terms, setTerms] = useState<TermType[]>([]);
    const [loading, setLoading] = useState(false);
    const [id_number, setIdNumber] = useState<string>(initialData?.id_number?.toString() || "");

    // Update full name when first name or last name changes
    useEffect(() => {
        const newFullName = `${firstName} ${lastName}`.trim();
        setFullName(newFullName);
    }, [firstName, lastName]);

    useEffect(() => {

        if (isOpen) { // Fetch terms
            // API.get(`/terms?school_id=${user?.school_id}`).then((res) => setTerms(res.data || [])).catch(() => setTerms([]));
            // Fetch classrooms
            // API.get(`/classrooms/term/${term_id}`).then((res) => setClassrooms(res.data || [])).catch(() => setClassrooms([]));

            // Reset form if not editing
            if (!initialData) {
                setFirstName("");
                setLastName("");
                setFullName("");
                setDob(undefined);
                setAddress("");
                setParentPhone("");
                setProfileUrl("");
                setSex("male");
                setClassroom_id("");
                setTerm_id("");
                setStatus("active");
                setIdNumber("");
            } else {
                setFirstName(initialData.firstName || "");
                setLastName(initialData.lastName || "");
                setFullName(initialData.name || "");
                setDob(initialData.dob ? new Date(initialData.dob) : undefined);
                setAddress(initialData.address || "");
                setParentPhone(initialData.parentPhone || "");
                setProfileUrl(initialData.profileUrl || "");
                setSex(initialData.sex || "male");
                setClassroom_id(initialData.classroom_id || "");
                setTerm_id(initialData.term_id || "");
                setStatus(initialData.status || "active");
                setIdNumber(initialData.id_number || "");
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!fullName.trim()) {
            toast.error("Full name is required");
            setLoading(false);
            return;
        }

        if (!parentPhone.trim()) {
            toast.error("Parent phone is required");
            setLoading(false);
            return;
        }

        if (!id_number) {
            toast.error("Student ID number is required");
            setLoading(false);
            return;
        }


        // Prepare student data object for API submission
        const data = {
            name: fullName, // Full name displayed in the system
            firstName: firstName.trim(), // First name with whitespace removed
            lastName: lastName.trim(), // Last name with whitespace removed
            dob: dob ? format(dob, "yyyy-MM-dd") : undefined, // Format date of birth to ISO format
            address: address.trim(), // Student's address with whitespace removed
            profileUrl: profileUrl.trim(), // URL to student's profile image
            parentPhone: parentPhone.trim(), // Contact number for parent/guardian
            sex, // Gender of the student (male/female)
            status, // Current enrollment status (active/inactive)
            school_id: user?.school_id || undefined,
            classroom_id: classroom_id || undefined, // Current classroom assignment
            term_id: term_id || undefined, // Current term assignment
            id_number: id_number || undefined,
            enrollments: [{
                term_id: term_id || undefined, // Term for this enrollment
                classroom_id: classroom_id || undefined, // Classroom for this enrollment
            }],
        };

        try {
            if (initialData) { // Update existing student
                await API.put(`/students/${initialData._id
                    }`, data);
                toast.success("Student updated successfully");
            } else { // Create new student
                await API.post("/students", data);
                toast.success("Student created successfully");
            }

            // Close modal and refresh data
            onClose();
            onSuccess?.();

            // Reset form
            setFirstName("");
            setLastName("");
            setFullName("");
            setDob(undefined);
            setAddress("");
            setParentPhone("");
            setProfileUrl("");
            setSex("male");
            setClassroom_id("");
            setTerm_id("");
            setStatus("active");
            setIdNumber("");
            setUrl("");
        } catch (error) {
            console.error("Error saving student:", error);
            toast.error("Failed to save student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen}
            onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle> {
                        initialData ? "✍️ Edit Student" : "👨‍🎓 បង្កើតសិស្សថ្មី"
                    } </DialogTitle>
                    <DialogDescription> {
                        initialData ? "Update student information" : "Add a new student to the system"
                    } </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}
                    className="space-y-4">
                    {/* Avatar and Image Picker */}
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20 ring-2 ring-blue-200">
                            <AvatarImage src={profileUrl || url} alt={fullName || "Student"} className="object-cover"/>
                            <AvatarFallback>{(firstName?.[0] || "").toUpperCase()}{(lastName?.[0] || "").toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={uploading}
                                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {uploading && (
                                <div className="text-xs text-blue-600 mt-1">Uploading: {uploadProgress}%</div>
                            )}
                            {!uploading && uploadProgress === 100 && (
                                <div className="text-xs text-green-600 mt-1">Upload complete!</div>
                            )}
                            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">លេខរៀងសិស្ស</label>

                        <div className="flex gap-2">
                            <Input placeholder="Id number"
                                value={id_number}
                                onChange={
                                    (e) => {
                                        const value = e.target.value;
                                        setIdNumber(value);
                                    }
                                }
                                className="mt-1 flex-1"
                                type="number" />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const randomId = Math.floor(Math.random() * 900000) + 100000;
                                    setIdNumber(randomId.toString());
                                }}
                                className="mt-1 px-3"
                            >
                                Generate
                            </Button>
                        </div>
                    </div>
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">ត្រកូល</label>
                            <Input placeholder="First name"
                                value={firstName}
                                onChange={
                                    (e) => setFirstName(e.target.value)
                                }
                                className="mt-1" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">ឈ្មោះ</label>
                            <Input placeholder="Last name"
                                value={lastName}
                                onChange={
                                    (e) => setLastName(e.target.value)
                                }
                                className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">ឈ្មោះពេញ</label>
                        <Input placeholder="Full name (auto-generated)"
                            value={fullName}
                            onChange={
                                (e) => setFullName(e.target.value)
                            }
                            className="mt-1" />
                    </div>

                    ថ្ងៃខែឆ្នាំកំណើត
                    <div>
                        <Popover open={openCalenda} modal={true} onOpenChange={setOpenCalenda}>
                            <PopoverTrigger asChild className="mt-1">
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-48 justify-between font-normal"
                                >
                                    {dob ? dob.toLocaleDateString() : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dob}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setDob(date)
                                        // setOpenCalenda(false)
                                    }}
                                />

                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    {/* Sex/Gender */}
                    <div>
                        <label className="text-sm font-medium">ភេទ</label>
                        <Select value={sex} onValueChange={(value: "male" | "female") => setSex(value)}>
                            <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">ប្រុស</SelectItem>
                                <SelectItem value="female">ស្រី</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-sm font-medium">អាសយដ្ឋាន</label>
                        <Input placeholder="Student address"
                            value={address}
                            onChange={
                                (e) => setAddress(e.target.value)
                            }
                            className="mt-1" />
                    </div>

       
                    <div>
                        <label className="text-sm font-medium">លេខទូរស័ព្ទអណាព្យាបាល *</label>
                        <Input placeholder="Parent phone number"
                            value={parentPhone}
                            onChange={
                                (e) => setParentPhone(e.target.value)
                            }
                            className="mt-1"
                            required />
                    </div>

                    {/* Term and Classroom Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* <div>
                            <label className="text-sm font-medium">ឆមាស</label>
                            <Select value={term_id} onValueChange={setTerm_id}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                                <SelectContent>
                                    {terms.map((term) => (
                                        <SelectItem key={term._id} value={term._id}>
                                            {term.year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}
                        {/* <div>
                            <label className="text-sm font-medium">បន្ទប់សិក្សា</label>
                            <Select value={classroom_id} onValueChange={setClassroom_id}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select classroom" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classrooms.map((classroom) => (
                                        <SelectItem key={classroom._id} value={classroom._id}>
                                            {classroom.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="text-sm font-medium">ស្ថានភាព</label>
                        <Select value={status}
                            onValueChange={
                                (value: "active" | "inactive") => setStatus(value)
                            }>
                            <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline"
                            onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit"
                            disabled={loading}>
                            {
                                loading ? "Saving..." : initialData ? "Update Student" : "Create Student"
                            } </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
