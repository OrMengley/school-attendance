import {useState, useEffect} from "react";
import DataTable from "../../components/school/data-table";
import {toast} from "sonner";
import useFetchData from "../../hooks/useFetchData";
import {Button} from "../../components/ui/button";
import SchoolCreateGradeModal from "../../components/school/school-gradeModal";
import API from "../../lib/axios";

interface TermType {
    _id?: string;
    id?: string;
    year: string;
}

interface GradeType {
    _id: string;
    name: string;
    termId: string;
    schoolId?: string;
    createdAt: string;
    term: TermType;
}

export default function SchoolGrade() {
    const {data: grades, loading: loadingGrades, refetch} = useFetchData < GradeType > ("/grades");
    const {data: terms, loading: loadingTerms} = useFetchData < TermType > ("/terms");
    const [termMap, setTermMap] = useState < Record < string,
        string >> ({});
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<GradeType | null>(null);

    const handleOpenCreate = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (grade: GradeType) => {
        setEditData(grade);
        setModalOpen(true);
    };

    const handleSubmitGrade = async (data: { _id?: string; name: string; termId: string; schoolId?: string }) => {
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

    useEffect(() => {
        if (terms && terms.length > 0) {
            console.log("Terms data:", terms);
            const map: Record < string,
                string > = {};
            terms.forEach((term) => { // Use either _id or id depending on what's available
                const termId = term._id || term.id;
                if (termId) {
                    map[termId] = term.year;
                }
            });
            console.log("Term map:", map);
            setTermMap(map);
        }
    }, [terms]);

    useEffect(() => {
        if (grades && grades.length > 0) {
            console.log("Grades data:", grades);
            console.log("Term map for grades:", termMap);
        }
    }, [grades, termMap]);

    const mappedGrades = grades.map((g) => ({
        ...g,
        termYear: termMap[g.termId] || "Unknown"
    }));

    if (loadingGrades || loadingTerms) 
        return <p>Loading grades...</p>;
    
    return (
        <>
          <Button onClick={handleOpenCreate}>Create Grade</Button>
            <DataTable title="🎓 Grades"
              key={grades.length}
                data={mappedGrades}
                columns={
                    [
                        {
                            label: "Name",
                            key: "name"
                        }, {
                            label: "Term",
                            key: "termYear"
                        }, {
                            label: "Created",
                            key: "createdAt"
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
              initialData={editData}
            />
        </>
    );


}
