graph={
    'A':['B','C'],
    'B':['D','E'],
    'C':['F'],
    'D':[],
    'F':[]
}
visited=[]
queue=[]
start=input("Enter starting node:").upper()
ifstart not in graph
    print("Invalid starting node")
else:
queue.append(start)
while queue:
    node=queue.pop(0)
    if node not in visited:
        print(node,end="")
        visited.append(node)
        for n in graph[node]:
            queue.append(n)