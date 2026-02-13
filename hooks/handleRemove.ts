const handleRemoveStudent = (studentId: string) => {
        Alert.alert(
            "Remove Student",
            "Are you sure you want to remove this student from the subject?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(
                                `/tests/subject/${selectedSubject._id}/students/${studentId}`
                            );

                            // remove from local state instantly
                            setStudents((prev: any) =>
                                prev.filter((s: any) => s._id !== studentId)
                            );
                        } catch (error) {
                            console.log(error);
                            Alert.alert("Error", "Failed to remove student");
                        }
                    },
                },
            ]
        );
    };