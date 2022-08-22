#include <stdio.h>
#include <stdlib.h>

typedef struct LNode{
	int data;
   struct LNode* next;
}LNode,*Linklist;

Linklist headinsert(){
   int c;
   LNode *S;
   Linklist L;
   L=(Linklist)malloc(sizeof(LNode));
   L->next=NULL;
   scanf("%d",&c);
   while(c!=999){
      S=(LNode *)malloc(sizeof(LNode));
      S->data=c;
      S->next=L->next;
      L->next=S;
      scanf("%d",&c);
   }
   return L;
}

//Linklist TailInsert(){}

void printList(Linklist L){
    while(L != NULL){  
        printf("%d ", L->data);
        L = L->next; //向后遍历
    } 
}

int main() {
   Linklist head;
   head=headinsert();
   printList(head->next);
}