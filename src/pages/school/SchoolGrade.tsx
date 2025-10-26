import {useState, useEffect} from "react";
import DataTable from "../../components/school/data-table";
import {toast} from "sonner";
import useFetchData from "../../hooks/useFetchData";
import {Button} from "../../components/ui/button";
import SchoolCreateGradeModal from "../../components/school/school-gradeModal";
import API from "../../lib/axios";
import type { TermType } from "../../types/Term";
import type { GradeType } from "../../types/Grade";
import type { DepartmentType } from "../../types/Department";
import { useUser } from "../../context/UserContext";



export default function SchoolGrade() {
    const { user } = useUser();
    // 
    const {data: grades, refetch} = useFetchData < GradeType > ("/grades");
    const [terms , setTerms] = useState < TermType[] > ([]);
    const [departments, setDepartments] = useState < DepartmentType[] > ([]);
    
    const [termMap, setTermMap] = useState < Record < string,
        string >> ({});
    const [departmentMap, setDepartmentMap] = useState < Record < string,
        string >> ({});
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<GradeType | null>(null);

   
    
    useEffect(() => {
        if (grades && Array.isArray(grades) && grades.length > 0) {
            console.log("Grades data:", grades);
            console.log("Term map for grades:", termMap);
        }
    }, [grades, termMap]);
    
    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const res = await API.get(`/terms?school_id=${user?.school_id}`);
                console.log("Terms data:", res.data);
                if (res.data && Array.isArray(res.data)) {
                    setTerms(res.data);
                }
            } catch (error) {
                console.error("Error fetching terms:", error);
                setTerms([]);
            }
        };

        const fetchDepartments = async () => {
            try {
                const res = await API.get(`/departments?school_id=${user?.school_id}`);
                console.log("Departments data:", res.data);
                if (res.data && Array.isArray(res.data)) {
                    setDepartments(res.data);
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
                setDepartments([]);
            }
        };

        if (user?.school_id) {
            fetchTerms();
            fetchDepartments();
        }
    }, [user?.school_id]);

    // Create term mapping whenever terms data changes
    useEffect(() => {
        if (terms && Array.isArray(terms) && terms.length > 0) {
            console.log("Creating term map from terms:", terms);
            const map: Record<string, string> = {};
            terms.forEach((term) => {
                const term_id = term._id;
                if (term_id) {
                    map[term_id] = term.year;
                }
            });
            console.log("Term map:", map);
            setTermMap(map);
        }
    }, [terms]);

    // Create department mapping whenever departments data changes
    useEffect(() => {
        if (departments && Array.isArray(departments) && departments.length > 0) {
            console.log("Creating department map from departments:", departments);
            const map: Record<string, string> = {};
            departments.forEach((department) => {
                const department_id = department._id;
                if (department_id) {
                    map[department_id] = department.name;
                }
            });
            console.log("Department map:", map);
            setDepartmentMap(map);
        }
    }, [departments]);

   


     const handleOpenCreate = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (grade: GradeType) => {
        setEditData(grade);
        setModalOpen(true);
    };

    const handleSubmitGrade = async (data: { _id?: string; name: string; term_id?: string; school_id?: string , department_id?: string }) => {
        try {
            if (editData) {
                // Update existing grade
                await API.put(`/grades/${editData._id}`, data);
                toast.success("Grade updated successfully");
            } else {
                // Create new grade
                await API.post("/grades", data);
                toast.success("Grade created successfully");
            }
            setModalOpen(false);
            refetch();
        } catch (error) {
            console.error("Error saving grade:", error);
            toast.error("Failed to save grade");
        }
    };
    const handleDeleteGrades = async (ids : string[]) => {
        try {

            console.log("Deleting grades with IDs:", ids);
            toast.success(`Successfully deleted ${
                ids.length
            } grades(s)`);
            // Refetch data after deletion
            refetch();
        } catch (error) {
            console.error("Error deleting grades:", error);
            toast.error("Failed to delete grades");
        }
    };

    const mappedGrades = (grades || []).map((g) => ({
        ...g,
        termYear: termMap[g.term_id] || "Unknown",
        departmentName: departmentMap[g.department_id] || "Unknown"
    }));
    
    
    return (
        <>
          <Button onClick={handleOpenCreate}>Create Grade</Button>
            <DataTable title="🎓 Grades"
              key={(grades || []).length}
                data={mappedGrades}
                columns={
                    [
                        {
                            label: "Name",
                            key: "name"
                        }, {
                            label: "Department",
                            key: "departmentName"
                        }, {
                            label: "Term",
                            key: "termYear"
                        },
                    ]
                }
                actions={
                    (grade) => (
                        <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(grade)}>
                                Edit
                            </Button>
                        </div>
                    )
                }
                onDelete={handleDeleteGrades}
            />

            <SchoolCreateGradeModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSubmit={handleSubmitGrade}
            //   initialData={editData}
            />
        </>
    );


}
