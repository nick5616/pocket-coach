//@desc Get all tasks
//@route Get /

const getTasks = async ({ response }: { response: any }) => {
	response.body = "ReturnedTasks";
};

export { getTasks };