import { useEffect, useState } from "react"
import API from "../../lib/axios"
import { Button } from "../../components/ui/button"
import type { UserType } from "../../types/User";
import type {ClassroomType} from "../../types/Classroom";
import type { SchoolType } from "../../types/SchoolType";





export default function TeacherProfile() {
  const [profile, setProfile] = useState<UserType | null>(null)
  const [school, setSchool] = useState<SchoolType | null>(null)
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userJson = localStorage.getItem("user")
    if (!userJson) {
      setLoading(false)
      return
    }
    const user: UserType = JSON.parse(userJson)
    setProfile(user)

    const fetchExtraData = async () => {
      try {
        // fetch school info
        if (user.school_id) {
            if (user.school_id) {
                const res = await API.get(`/schools/${user.school_id}`)
                setSchool(res.data)
              }
          
        }

        // fetch classroom info
        if (user.classroomIds && user.classroomIds.length > 0) {
          const res = await API.get("/classrooms")
          const filtered = res.data.filter((c: any) =>
            user.classroomIds?.includes(c._id)
          )
          setClassrooms(filtered)
        }
      } catch (err) {
        console.error("Failed to fetch additional data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchExtraData()
  }, [])

  if (loading) return <div className="p-4">Loading profile...</div>
  if (!profile) return <div className="p-4 text-red-600">Profile not found</div>

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
          {profile.name.charAt(0)}
        </div>
        <h1 className="mt-4 text-xl font-bold">{profile.name}</h1>
        <p className="text-gray-500">{profile.email}</p>
      </div>

      {school && (
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">School</span>
            <span className="text-gray-700">{school.name}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Assigned Classrooms</h2>
        {classrooms.length === 0 ? (
          <p className="text-gray-500 text-sm">No classrooms assigned</p>
        ) : (
          <ul className="space-y-2">
            {classrooms.map((c) => (
              <li
                key={c._id}
                className="border rounded-lg px-3 py-2 bg-gray-50"
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className="w-full"
          onClick={() => alert("Edit profile feature coming soon!")}
        >
          Edit Profile
        </Button>
        <Button
          className="w-full bg-red-500 hover:bg-red-600"
          onClick={() => {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            window.location.href = "/login"
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  )
}